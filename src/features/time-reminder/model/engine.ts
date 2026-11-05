/**
 * Pure accounting rules for active time. No DOM, no storage — easy to test.
 */

export interface ReminderPreferences {
	enabled: boolean;
	desktopEnabled: boolean;
	intervalHours: number;
	/** Epoch ms; reminders are held until this time. */
	snoozedUntil: number | null;
}

export interface ActiveTimeProgress {
	/** Local calendar day (YYYY-MM-DD) the counter belongs to. */
	day: string;
	/** Accumulated active milliseconds for the day. Breaks never reset it. */
	activeMs: number;
	/** Active ms at which the current reminder interval started. */
	baselineMs: number;
	/** Tab currently allowed to add time (the one the user last interacted with). */
	ownerTabId: string | null;
	/** Epoch ms of an in-app reminder awaiting acknowledgement, if any. */
	pendingReminderAt: number | null;
	updatedAt: number;
}

export function localDay(epochMs: number) {
	const date = new Date(epochMs);
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${month}-${day}`;
}

export function createProgress(now: number): ActiveTimeProgress {
	return { day: localDay(now), activeMs: 0, baselineMs: 0, ownerTabId: null, pendingReminderAt: null, updatedAt: now };
}

/** Starts a fresh counter on a new calendar day; otherwise returns the progress unchanged. */
export function rollOverDay(progress: ActiveTimeProgress, now: number): ActiveTimeProgress {
	const today = localDay(now);
	if (progress.day === today) return progress;
	return { ...createProgress(now), ownerTabId: progress.ownerTabId };
}

export interface ActiveDeltaInput {
	now: number;
	lastTickAt: number | null;
	lastInteractionAt: number;
	/** Visible and focused. */
	foreground: boolean;
	idleThresholdMs: number;
	maxTickGapMs: number;
}

/**
 * Active milliseconds between the previous tick and now.
 * - Nothing counts while backgrounded, hidden or blurred.
 * - Time after the idle threshold has elapsed since the last interaction does not count.
 * - A gap longer than `maxTickGapMs` (sleep, frozen tab) counts as zero.
 */
export function computeActiveDelta({ now, lastTickAt, lastInteractionAt, foreground, idleThresholdMs, maxTickGapMs }: ActiveDeltaInput) {
	if (!foreground || lastTickAt === null) return 0;
	const gap = now - lastTickAt;
	if (gap <= 0 || gap > maxTickGapMs) return 0;
	const activeUntil = Math.min(now, lastInteractionAt + idleThresholdMs);
	return Math.max(0, activeUntil - lastTickAt);
}

export function isUserActive(now: number, lastInteractionAt: number, foreground: boolean, idleThresholdMs: number) {
	return foreground && now - lastInteractionAt <= idleThresholdMs;
}

export function isSnoozed(preferences: ReminderPreferences, now: number) {
	return preferences.snoozedUntil !== null && preferences.snoozedUntil > now;
}

/** One reminder per interval of active use since the interval started. */
export function isReminderDue(progress: ActiveTimeProgress, preferences: ReminderPreferences, intervalMs: number, now: number) {
	if (!preferences.enabled || intervalMs <= 0 || isSnoozed(preferences, now)) return false;
	return progress.activeMs - progress.baselineMs >= intervalMs;
}

/** Hours to quote in the message: the configured interval, or more if the day has run longer. */
export function reminderHours(progress: ActiveTimeProgress, preferences: ReminderPreferences, hourMs: number) {
	return Math.max(preferences.intervalHours, Math.floor(progress.activeMs / hourMs));
}
