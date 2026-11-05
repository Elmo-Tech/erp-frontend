import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_RUNTIME_CONFIG, HOUR_MS, MINUTE_MS, type TimeReminderRuntimeConfig } from "../config";
import { formatArabicHours, getReminderMessages } from "../i18n/messages";
import { TimeReminderController } from "../model/controller";
import { computeActiveDelta, createProgress, isReminderDue, rollOverDay, type ReminderPreferences } from "../model/engine";
import { DEFAULT_PREFERENCES, readProgress, writeProgress, type StorageLike } from "../model/storage";

const SECOND = 1000;
const START = new Date(2026, 10, 5, 9, 0, 0).getTime();

class MemoryStorage implements StorageLike {
	private data = new Map<string, string>();
	getItem(key: string) {
		return this.data.get(key) ?? null;
	}
	setItem(key: string, value: string) {
		this.data.set(key, value);
	}
	removeItem(key: string) {
		this.data.delete(key);
	}
}

/** A fake window/document pair whose focus and visibility the test controls. */
function createEnvironment() {
	const win = new EventTarget() as unknown as Window;
	const doc = new EventTarget() as unknown as Document & { _visible: boolean; _focused: boolean };
	doc._visible = true;
	doc._focused = true;
	Object.defineProperty(doc, "visibilityState", { get: () => (doc._visible ? "visible" : "hidden") });
	(doc as unknown as { hasFocus: () => boolean }).hasFocus = () => doc._focused;
	return {
		window: win,
		document: doc,
		blur() {
			doc._focused = false;
			win.dispatchEvent(new Event("blur"));
		},
		focus() {
			doc._focused = true;
			win.dispatchEvent(new Event("focus"));
		},
		hide() {
			doc._visible = false;
			doc.dispatchEvent(new Event("visibilitychange"));
		},
		interact() {
			win.dispatchEvent(new Event("pointerdown"));
		},
	};
}

const flush = async () => {
	for (let index = 0; index < 5; index += 1) await Promise.resolve();
};

describe("engine", () => {
	const base = { idleThresholdMs: 10 * MINUTE_MS, maxTickGapMs: 60 * SECOND };

	it("counts elapsed time only while foreground", () => {
		expect(computeActiveDelta({ ...base, now: START + 15 * SECOND, lastTickAt: START, lastInteractionAt: START, foreground: true })).toBe(15 * SECOND);
		expect(computeActiveDelta({ ...base, now: START + 15 * SECOND, lastTickAt: START, lastInteractionAt: START, foreground: false })).toBe(0);
	});

	it("stops counting at the idle threshold", () => {
		const lastInteractionAt = START;
		const lastTickAt = START + 9 * MINUTE_MS + 50 * SECOND;
		expect(computeActiveDelta({ ...base, now: lastTickAt + 30 * SECOND, lastTickAt, lastInteractionAt, foreground: true })).toBe(10 * SECOND);
	});

	it("never counts a long gap such as sleep", () => {
		expect(computeActiveDelta({ ...base, now: START + 2 * HOUR_MS, lastTickAt: START, lastInteractionAt: START + 2 * HOUR_MS, foreground: true })).toBe(0);
	});

	it("is due once per interval and respects disable and snooze", () => {
		const progress = { ...createProgress(START), activeMs: 6 * HOUR_MS };
		expect(isReminderDue(progress, DEFAULT_PREFERENCES, 6 * HOUR_MS, START)).toBe(true);
		expect(isReminderDue({ ...progress, baselineMs: 6 * HOUR_MS }, DEFAULT_PREFERENCES, 6 * HOUR_MS, START)).toBe(false);
		expect(isReminderDue(progress, { ...DEFAULT_PREFERENCES, enabled: false }, 6 * HOUR_MS, START)).toBe(false);
		expect(isReminderDue(progress, { ...DEFAULT_PREFERENCES, snoozedUntil: START + 1 }, 6 * HOUR_MS, START)).toBe(false);
	});

	it("starts a fresh counter on a new day", () => {
		const progress = { ...createProgress(START), activeMs: 5 * HOUR_MS, baselineMs: 1 };
		expect(rollOverDay(progress, START + 24 * HOUR_MS).activeMs).toBe(0);
		expect(rollOverDay(progress, START + HOUR_MS)).toBe(progress);
	});
});

describe("messages", () => {
	it("renders the specified Arabic copy for six hours", () => {
		const ar = getReminderMessages("ar");
		expect(ar.title).toBe("خد بالك من الوقت ⏰");
		expect(ar.body(6)).toBe("أنت شغال على السيستم بقالك ٦ ساعات. خد بريك صغير وراجع وقتك.");
		expect(formatArabicHours(2)).toBe("ساعتين");
		expect(formatArabicHours(12)).toBe("١٢ ساعة");
	});
});

describe("TimeReminderController", () => {
	const userId = 7;
	const interval = 2 * MINUTE_MS;
	const config: TimeReminderRuntimeConfig = { ...DEFAULT_RUNTIME_CONFIG, intervalMsOverride: interval, idleThresholdMs: MINUTE_MS, tickMs: 60 * 60 * 1000, activityThrottleMs: 0 };
	let now: number;
	let storage: MemoryStorage;
	let preferences: ReminderPreferences;
	const controllers: TimeReminderController[] = [];

	const create = (options: Partial<{ desktop: boolean; desktopOk: boolean; env: ReturnType<typeof createEnvironment> }> = {}) => {
		const env = options.env ?? createEnvironment();
		const deliverDesktop = vi.fn(() => options.desktopOk ?? true);
		const controller = new TimeReminderController({
			userId,
			config,
			storage,
			now: () => now,
			getPreferences: () => preferences,
			canDeliverDesktop: () => options.desktop ?? false,
			deliverDesktop,
			environment: { window: env.window, document: env.document },
		});
		controller.start();
		controllers.push(controller);
		return { controller, env, deliverDesktop };
	};

	/** Advances the clock in tick-sized steps, interacting before each tick. */
	const work = async (controller: TimeReminderController, env: ReturnType<typeof createEnvironment>, durationMs: number, step = 15 * SECOND) => {
		for (let elapsed = 0; elapsed < durationMs; elapsed += step) {
			now += step;
			env.interact();
			await flush();
		}
		await controller.tick();
	};

	const progress = () => readProgress(userId, now, storage);

	beforeEach(() => {
		now = START;
		storage = new MemoryStorage();
		preferences = { ...DEFAULT_PREFERENCES };
	});

	afterEach(() => {
		controllers.splice(0).forEach((controller) => controller.stop());
	});

	it("accumulates active use and shows one in-app reminder per interval", async () => {
		const { controller, env } = create();
		await work(controller, env, interval);
		expect(progress().activeMs).toBe(interval);
		expect(progress().pendingReminderAt).toBe(now);

		// Dismiss, keep working less than another interval: no repeat.
		writeProgress(userId, { ...progress(), pendingReminderAt: null }, storage);
		await work(controller, env, interval - 15 * SECOND);
		expect(progress().pendingReminderAt).toBeNull();

		await work(controller, env, 15 * SECOND);
		expect(progress().pendingReminderAt).toBe(now);
	});

	it("pauses while idle, suppresses reminders, and resumes without resetting", async () => {
		const { controller, env } = create();
		await work(controller, env, 30 * SECOND);

		// Idle for 20 minutes: only the idle window (1 min) after the last interaction counts.
		for (let index = 0; index < 80; index += 1) {
			now += 15 * SECOND;
			await controller.tick();
		}
		expect(progress().activeMs).toBe(90 * SECOND);
		expect(progress().pendingReminderAt).toBeNull();

		// Returning resumes from 90s rather than zero (the idle stretch before the return click
		// is not counted); the reminder arrives at 2 min of active use.
		await work(controller, env, 30 * SECOND);
		expect(progress().activeMs).toBe(105 * SECOND);
		expect(progress().pendingReminderAt).toBeNull();
		await work(controller, env, 15 * SECOND);
		expect(progress().activeMs).toBe(interval);
		expect(progress().pendingReminderAt).toBe(now);
	});

	it("pauses when the window loses focus or is hidden", async () => {
		const { controller, env } = create();
		await work(controller, env, 30 * SECOND);
		env.blur();
		now += 5 * MINUTE_MS;
		await controller.tick();
		expect(progress().activeMs).toBe(30 * SECOND);

		env.focus();
		await flush();
		await work(controller, env, 30 * SECOND);
		env.hide();
		now += 5 * MINUTE_MS;
		await controller.tick();
		expect(progress().activeMs).toBe(MINUTE_MS);
	});

	it("does not count computer sleep", async () => {
		const { controller, env } = create();
		await work(controller, env, 30 * SECOND);
		now += 3 * HOUR_MS; // laptop lid closed, timers frozen
		env.interact();
		await flush();
		await controller.tick();
		expect(progress().activeMs).toBe(30 * SECOND);
	});

	it("preserves progress across a refresh", async () => {
		const first = create();
		await work(first.controller, first.env, MINUTE_MS);
		first.controller.stop();

		const second = create();
		await work(second.controller, second.env, MINUTE_MS);
		expect(progress().activeMs).toBe(2 * MINUTE_MS);
		expect(progress().pendingReminderAt).toBe(now);
	});

	it("does not double count across tabs and delivers a reminder once", async () => {
		const tabA = create();
		const tabB = create();
		// The user clicks into tab A while tab B also (wrongly) believes it is focused.
		tabA.env.interact();
		await flush();
		for (let elapsed = 0; elapsed < interval; elapsed += 15 * SECOND) {
			now += 15 * SECOND;
			tabA.env.interact();
			await flush();
			await tabB.controller.tick();
		}
		await tabA.controller.tick();
		await tabB.controller.tick();
		expect(progress().activeMs).toBe(interval);
		expect(progress().ownerTabId).toBe(tabA.controller.tabId);
		expect(progress().pendingReminderAt).toBe(now);

		// Switching to tab B transfers ownership; it does not re-deliver the same reminder.
		writeProgress(userId, { ...progress(), pendingReminderAt: null }, storage);
		now += 15 * SECOND;
		tabB.env.interact();
		await flush();
		await tabB.controller.tick();
		expect(progress().ownerTabId).toBe(tabB.controller.tabId);
		expect(progress().pendingReminderAt).toBeNull();
	});

	it("uses desktop notifications when granted and falls back in-app when they fail", async () => {
		preferences = { ...preferences, desktopEnabled: true };
		const granted = create({ desktop: true });
		await work(granted.controller, granted.env, interval);
		expect(granted.deliverDesktop).toHaveBeenCalledTimes(1);
		expect(progress().pendingReminderAt).toBeNull();
		granted.controller.stop();

		storage = new MemoryStorage();
		const failing = create({ desktop: true, desktopOk: false });
		await work(failing.controller, failing.env, interval);
		expect(failing.deliverDesktop).toHaveBeenCalledTimes(1);
		expect(progress().pendingReminderAt).toBe(now);
	});

	it("uses the in-app reminder when desktop is enabled but permission is denied", async () => {
		preferences = { ...preferences, desktopEnabled: true };
		const { controller, env, deliverDesktop } = create({ desktop: false });
		await work(controller, env, interval);
		expect(deliverDesktop).not.toHaveBeenCalled();
		expect(progress().pendingReminderAt).toBe(now);
	});

	it("holds reminders while snoozed and delivers once the snooze ends", async () => {
		preferences = { ...preferences, snoozedUntil: START + interval + MINUTE_MS };
		const { controller, env } = create();
		await work(controller, env, interval);
		expect(progress().pendingReminderAt).toBeNull();

		await work(controller, env, MINUTE_MS);
		expect(progress().pendingReminderAt).toBe(now);
	});

	it("delivers nothing while reminders are disabled", async () => {
		preferences = { ...preferences, enabled: false };
		const { controller, env } = create();
		await work(controller, env, interval * 2);
		expect(progress().activeMs).toBe(interval * 2);
		expect(progress().pendingReminderAt).toBeNull();
	});

	it("stops counting after stop() (logout)", async () => {
		const { controller, env } = create();
		await work(controller, env, 30 * SECOND);
		controller.stop();
		now += MINUTE_MS;
		env.interact();
		await flush();
		await controller.tick();
		expect(progress().activeMs).toBe(30 * SECOND);
	});
});
