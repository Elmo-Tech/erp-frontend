/**
 * Time-awareness reminder configuration.
 * Production defaults live here; a non-production debug override exists for verification only.
 */

export const HOUR_MS = 60 * 60 * 1000;
export const MINUTE_MS = 60 * 1000;

/** Default reminder interval in hours of accumulated active use. */
export const DEFAULT_INTERVAL_HOURS = 6;
export const INTERVAL_HOUR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/** A user counts as active if they interacted within this window (configurable default). */
export const DEFAULT_IDLE_THRESHOLD_MS = 10 * MINUTE_MS;

/** How often the foreground tab accounts for elapsed active time. */
export const TICK_MS = 15 * 1000;

/**
 * Gaps between ticks longer than this are never counted. A focused tab ticks every
 * TICK_MS, so a longer gap means the machine slept or the tab was frozen.
 */
export const MAX_TICK_GAP_MS = 60 * 1000;

/** Interaction events are sampled at most this often; only a timestamp is kept. */
export const ACTIVITY_THROTTLE_MS = 5 * 1000;

export const SNOOZE_MS = HOUR_MS;

export const STORAGE_PREFIX = "elmo:time-reminder";
export const DEBUG_STORAGE_KEY = `${STORAGE_PREFIX}:debug`;

export interface TimeReminderRuntimeConfig {
	/** Overrides the preference interval when set (debug only). */
	intervalMsOverride: number | null;
	idleThresholdMs: number;
	tickMs: number;
	maxTickGapMs: number;
	activityThrottleMs: number;
	snoozeMs: number;
}

export const DEFAULT_RUNTIME_CONFIG: TimeReminderRuntimeConfig = {
	intervalMsOverride: null,
	idleThresholdMs: DEFAULT_IDLE_THRESHOLD_MS,
	tickMs: TICK_MS,
	maxTickGapMs: MAX_TICK_GAP_MS,
	activityThrottleMs: ACTIVITY_THROTTLE_MS,
	snoozeMs: SNOOZE_MS,
};

/**
 * Reads the runtime configuration. Outside production builds a developer can shorten
 * timings for verification without touching the defaults:
 *   localStorage.setItem("elmo:time-reminder:debug", JSON.stringify({ intervalMs: 60000, idleMs: 20000 }))
 */
export function getRuntimeConfig(): TimeReminderRuntimeConfig {
	if (process.env.NODE_ENV === "production" || typeof window === "undefined") return DEFAULT_RUNTIME_CONFIG;

	try {
		const raw = window.localStorage.getItem(DEBUG_STORAGE_KEY);
		if (!raw) return DEFAULT_RUNTIME_CONFIG;
		const debug = JSON.parse(raw) as Partial<{ intervalMs: number; idleMs: number; tickMs: number; snoozeMs: number }>;
		const positive = (value: unknown) => (typeof value === "number" && value > 0 ? value : null);
		const tickMs = positive(debug.tickMs) ?? DEFAULT_RUNTIME_CONFIG.tickMs;

		return {
			...DEFAULT_RUNTIME_CONFIG,
			intervalMsOverride: positive(debug.intervalMs),
			idleThresholdMs: positive(debug.idleMs) ?? DEFAULT_RUNTIME_CONFIG.idleThresholdMs,
			tickMs,
			maxTickGapMs: Math.max(DEFAULT_RUNTIME_CONFIG.maxTickGapMs, tickMs * 4),
			snoozeMs: positive(debug.snoozeMs) ?? DEFAULT_RUNTIME_CONFIG.snoozeMs,
		};
	} catch {
		return DEFAULT_RUNTIME_CONFIG;
	}
}
