"use client";

import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import type { ActiveTimeProgress, ReminderPreferences } from "./engine";
import { DEFAULT_PREFERENCES, preferencesKey, progressKey, readPreferences, readProgress, subscribeToKey, withProgressLock, writePreferences, writeProgress } from "./storage";
import { closeDesktopReminder } from "../lib/desktop-notifications";

/** Subscribes to a user-scoped JSON value with a stable snapshot. */
function useStoredValue<T>(key: string | null, read: () => T, fallback: T): T {
	const cache = useRef<{ raw: string | null; value: T } | null>(null);

	const getSnapshot = useCallback(() => {
		if (!key) return fallback;
		let raw: string | null = null;
		try {
			raw = window.localStorage.getItem(key);
		} catch {
			raw = null;
		}
		if (cache.current && cache.current.raw === raw) return cache.current.value;
		const value = read();
		cache.current = { raw, value };
		return value;
	}, [key, read, fallback]);

	const subscribe = useCallback((onChange: () => void) => (key ? subscribeToKey(key, onChange) : () => {}), [key]);

	return useSyncExternalStore(subscribe, getSnapshot, () => fallback);
}

const EMPTY_PROGRESS: ActiveTimeProgress = { day: "", activeMs: 0, baselineMs: 0, ownerTabId: null, pendingReminderAt: null, updatedAt: 0 };

export function useReminderPreferences(userId: string | number | null | undefined) {
	const key = userId != null ? preferencesKey(userId) : null;
	const read = useCallback(() => (userId != null ? readPreferences(userId) : DEFAULT_PREFERENCES), [userId]);
	return useStoredValue(key, read, DEFAULT_PREFERENCES);
}

export function useReminderProgress(userId: string | number | null | undefined) {
	const key = userId != null ? progressKey(userId) : null;
	const read = useCallback(() => (userId != null ? readProgress(userId) : EMPTY_PROGRESS), [userId]);
	return useStoredValue(key, read, EMPTY_PROGRESS);
}

/** Clears any reminder currently shown in-app or on the desktop. */
export function clearPendingReminder(userId: string | number) {
	closeDesktopReminder();
	return withProgressLock(userId, () => {
		const progress = readProgress(userId);
		if (progress.pendingReminderAt !== null) writeProgress(userId, { ...progress, pendingReminderAt: null });
	});
}

export function useReminderActions(userId: string | number | null | undefined) {
	return useMemo(() => {
		const update = (patch: Partial<ReminderPreferences>) => {
			if (userId == null) return;
			writePreferences(userId, { ...readPreferences(userId), ...patch });
		};

		return {
			setEnabled: async (enabled: boolean) => {
				if (userId == null) return;
				if (!enabled) {
					// Disabling stops pending reminders immediately.
					update({ enabled: false, snoozedUntil: null });
					await clearPendingReminder(userId);
					return;
				}
				// Re-enabling starts a fresh interval rather than firing for time already worked.
				await withProgressLock(userId, () => {
					const progress = readProgress(userId);
					writeProgress(userId, { ...progress, baselineMs: progress.activeMs, pendingReminderAt: null });
				});
				update({ enabled: true });
			},
			setDesktopEnabled: (desktopEnabled: boolean) => update({ desktopEnabled }),
			setIntervalHours: (intervalHours: number) => update({ intervalHours }),
			/**
			 * Holds reminders for `durationMs`. When snoozing a reminder that is showing,
			 * pass `rearmIntervalMs` so the reminder returns once the snooze ends.
			 */
			snooze: async (durationMs: number, rearmIntervalMs?: number) => {
				if (userId == null) return;
				update({ snoozedUntil: Date.now() + durationMs });
				closeDesktopReminder();
				await withProgressLock(userId, () => {
					const progress = readProgress(userId);
					const baselineMs = rearmIntervalMs ? Math.max(0, progress.activeMs - rearmIntervalMs) : progress.baselineMs;
					writeProgress(userId, { ...progress, baselineMs, pendingReminderAt: null });
				});
			},
			resume: () => update({ snoozedUntil: null }),
			dismiss: () => (userId == null ? Promise.resolve() : clearPendingReminder(userId)),
		};
	}, [userId]);
}
