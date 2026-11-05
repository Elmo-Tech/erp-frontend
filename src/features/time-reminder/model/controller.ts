import { HOUR_MS, type TimeReminderRuntimeConfig } from "../config";
import { computeActiveDelta, isReminderDue, isUserActive, reminderHours, rollOverDay, type ReminderPreferences } from "./engine";
import { readProgress, withProgressLock, writeProgress, type StorageLike } from "./storage";

export interface ReminderTrigger {
	at: number;
	hours: number;
}

export interface TimeReminderControllerOptions {
	userId: string | number;
	config: TimeReminderRuntimeConfig;
	getPreferences: () => ReminderPreferences;
	/** True when a desktop notification can be shown right now. */
	canDeliverDesktop: () => boolean;
	/** Shows a desktop notification; returns false if it failed so the in-app reminder is used. */
	deliverDesktop: (trigger: ReminderTrigger) => boolean;
	now?: () => number;
	storage?: StorageLike;
	tabId?: string;
	/** Defaults to the real document/window; injectable for tests. */
	environment?: { document: Document; window: Window };
}

const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"] as const;

function createTabId() {
	return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `tab-${Math.random().toString(36).slice(2)}`;
}

/**
 * Tracks active foreground use for one signed-in user in one tab.
 *
 * Counting rules: time accrues only while this document is visible and focused, the user
 * interacted within the idle threshold, and this tab is the most recently used one
 * (ownership prevents two windows from double counting). Ticks separated by more than
 * `maxTickGapMs` — sleep, frozen tabs — never count.
 */
export class TimeReminderController {
	readonly tabId: string;
	private readonly options: TimeReminderControllerOptions;
	private readonly now: () => number;
	private readonly doc: Document;
	private readonly win: Window;
	private lastTickAt: number | null = null;
	private lastInteractionAt = 0;
	private lastActivitySampleAt = 0;
	private foreground = false;
	private timer: ReturnType<typeof setInterval> | null = null;
	private running = false;

	constructor(options: TimeReminderControllerOptions) {
		this.options = options;
		this.now = options.now ?? Date.now;
		this.tabId = options.tabId ?? createTabId();
		this.doc = options.environment?.document ?? document;
		this.win = options.environment?.window ?? window;
	}

	start() {
		if (this.running) return;
		this.running = true;
		const now = this.now();
		this.foreground = this.readForeground();
		this.lastTickAt = now;
		// Opening or refreshing the app is itself a user action.
		this.lastInteractionAt = now;
		this.lastActivitySampleAt = now;
		if (this.foreground) void this.claimOwnership();

		for (const type of ACTIVITY_EVENTS) this.win.addEventListener(type, this.handleActivity, { passive: true, capture: true });
		this.win.addEventListener("scroll", this.handleActivity, { passive: true, capture: true });
		this.win.addEventListener("focus", this.handleFocus);
		this.win.addEventListener("blur", this.handleBlur);
		this.win.addEventListener("pagehide", this.handlePageHide);
		this.doc.addEventListener("visibilitychange", this.handleVisibility);
		this.timer = setInterval(() => void this.tick(), this.options.config.tickMs);
	}

	stop() {
		if (!this.running) return;
		this.tickSync();
		this.running = false;
		for (const type of ACTIVITY_EVENTS) this.win.removeEventListener(type, this.handleActivity, { capture: true });
		this.win.removeEventListener("scroll", this.handleActivity, { capture: true });
		this.win.removeEventListener("focus", this.handleFocus);
		this.win.removeEventListener("blur", this.handleBlur);
		this.win.removeEventListener("pagehide", this.handlePageHide);
		this.doc.removeEventListener("visibilitychange", this.handleVisibility);
		if (this.timer) clearInterval(this.timer);
		this.timer = null;
		this.lastTickAt = null;
	}

	/** Exposed for diagnostics and tests. */
	get state() {
		const now = this.now();
		return {
			foreground: this.foreground,
			active: isUserActive(now, this.lastInteractionAt, this.foreground, this.options.config.idleThresholdMs),
			lastInteractionAt: this.lastInteractionAt,
		};
	}

	private readForeground() {
		return this.doc.visibilityState === "visible" && this.doc.hasFocus();
	}

	private readonly handleActivity = () => {
		const now = this.now();
		if (now - this.lastActivitySampleAt < this.options.config.activityThrottleMs) return;
		this.lastActivitySampleAt = now;
		const wasIdle = !isUserActive(now, this.lastInteractionAt, this.foreground, this.options.config.idleThresholdMs);
		// Settle time up to the idle cutoff before recording the new interaction.
		void this.tick(now).then(() => {
			this.lastInteractionAt = Math.max(this.lastInteractionAt, now);
			if (!this.foreground) this.foreground = this.readForeground();
			if (wasIdle) this.lastTickAt = this.now();
			void this.claimOwnership();
		});
	};

	private readonly handleFocus = () => {
		void this.tick().then(() => {
			this.foreground = this.doc.visibilityState === "visible";
			this.lastTickAt = this.now();
			if (this.foreground) {
				this.lastInteractionAt = this.now();
				void this.claimOwnership();
			}
		});
	};

	private readonly handleBlur = () => {
		const now = this.now();
		this.tickSync(now);
		this.foreground = false;
	};

	private readonly handleVisibility = () => {
		if (this.doc.visibilityState === "hidden") {
			this.tickSync();
			this.foreground = false;
		} else {
			this.handleFocus();
		}
	};

	private readonly handlePageHide = () => {
		this.tickSync();
	};

	private claimOwnership() {
		const { userId, storage } = this.options;
		return withProgressLock(userId, () => {
			const now = this.now();
			const progress = rollOverDay(readProgress(userId, now, storage), now);
			if (progress.ownerTabId === this.tabId) return;
			writeProgress(userId, { ...progress, ownerTabId: this.tabId, updatedAt: now }, storage);
		});
	}

	/** Accounts elapsed time and checks for a due reminder under the cross-tab lock. */
	tick(now = this.now()): Promise<void> {
		if (!this.running) return Promise.resolve();
		let desktopTrigger: ReminderTrigger | null = null;
		return withProgressLock(this.options.userId, () => {
			desktopTrigger = this.apply(now);
		}).then(() => {
			if (desktopTrigger && !this.options.deliverDesktop(desktopTrigger)) this.markPending(desktopTrigger.at);
		});
	}

	/** Synchronous variant for unload/blur paths where async locks may not complete. */
	private tickSync(now = this.now()) {
		if (!this.running) return;
		const trigger = this.apply(now);
		if (trigger && !this.options.deliverDesktop(trigger)) this.markPending(trigger.at);
	}

	private apply(now: number): ReminderTrigger | null {
		const { userId, storage, config } = this.options;
		const delta = computeActiveDelta({
			now,
			lastTickAt: this.lastTickAt,
			lastInteractionAt: this.lastInteractionAt,
			foreground: this.foreground,
			idleThresholdMs: config.idleThresholdMs,
			maxTickGapMs: config.maxTickGapMs,
		});
		this.lastTickAt = now;
		const active = isUserActive(now, this.lastInteractionAt, this.foreground, config.idleThresholdMs);
		if (delta === 0 && !active) return null;

		const preferences = this.options.getPreferences();
		const stored = rollOverDay(readProgress(userId, now, storage), now);
		const ownsTime = stored.ownerTabId === null || stored.ownerTabId === this.tabId;
		const progress = { ...stored, activeMs: stored.activeMs + (ownsTime ? delta : 0), updatedAt: now };

		let trigger: ReminderTrigger | null = null;
		// Reminders are only delivered while the user is actively here, never while idle.
		if (active && ownsTime) {
			const intervalMs = config.intervalMsOverride ?? preferences.intervalHours * HOUR_MS;
			if (isReminderDue(progress, preferences, intervalMs, now)) {
				progress.baselineMs = progress.activeMs;
				trigger = { at: now, hours: reminderHours(progress, preferences, HOUR_MS) };
				if (!(preferences.desktopEnabled && this.options.canDeliverDesktop())) {
					progress.pendingReminderAt = now;
					trigger = null;
				}
			}
		}

		if (ownsTime || progress.day !== stored.day) writeProgress(userId, progress, storage);
		return trigger;
	}

	private markPending(at: number) {
		const { userId, storage } = this.options;
		const progress = readProgress(userId, at, storage);
		writeProgress(userId, { ...progress, pendingReminderAt: at }, storage);
	}
}
