import { DEFAULT_INTERVAL_HOURS, STORAGE_PREFIX } from "../config";
import { createProgress, type ActiveTimeProgress, type ReminderPreferences } from "./engine";

/**
 * Local, per-user persistence. Keys are scoped by user id so progress never leaks
 * between accounts on a shared machine. Only counters and preferences are stored —
 * never interaction details.
 */

export interface StorageLike {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
}

export const DEFAULT_PREFERENCES: ReminderPreferences = {
	enabled: true,
	desktopEnabled: false,
	intervalHours: DEFAULT_INTERVAL_HOURS,
	snoozedUntil: null,
};

const CHANGE_EVENT = `${STORAGE_PREFIX}:change`;

export const preferencesKey = (userId: string | number) => `${STORAGE_PREFIX}:prefs:${userId}`;
export const progressKey = (userId: string | number) => `${STORAGE_PREFIX}:progress:${userId}`;

function browserStorage(): StorageLike | null {
	try {
		return typeof window !== "undefined" ? window.localStorage : null;
	} catch {
		return null;
	}
}

function parse<T>(raw: string | null | undefined): Partial<T> | null {
	if (!raw) return null;
	try {
		const value = JSON.parse(raw);
		return value && typeof value === "object" ? (value as Partial<T>) : null;
	} catch {
		return null;
	}
}

const finiteOr = (value: unknown, fallback: number) => (typeof value === "number" && Number.isFinite(value) ? value : fallback);
const nullableNumber = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);

export function normalizePreferences(value: Partial<ReminderPreferences> | null): ReminderPreferences {
	if (!value) return DEFAULT_PREFERENCES;
	const interval = finiteOr(value.intervalHours, DEFAULT_INTERVAL_HOURS);
	return {
		enabled: typeof value.enabled === "boolean" ? value.enabled : DEFAULT_PREFERENCES.enabled,
		desktopEnabled: typeof value.desktopEnabled === "boolean" ? value.desktopEnabled : DEFAULT_PREFERENCES.desktopEnabled,
		intervalHours: interval >= 1 && interval <= 24 ? Math.round(interval) : DEFAULT_INTERVAL_HOURS,
		snoozedUntil: nullableNumber(value.snoozedUntil),
	};
}

export function normalizeProgress(value: Partial<ActiveTimeProgress> | null, now: number): ActiveTimeProgress {
	if (!value || typeof value.day !== "string") return createProgress(now);
	const activeMs = Math.max(0, finiteOr(value.activeMs, 0));
	return {
		day: value.day,
		activeMs,
		baselineMs: Math.min(activeMs, Math.max(0, finiteOr(value.baselineMs, 0))),
		ownerTabId: typeof value.ownerTabId === "string" ? value.ownerTabId : null,
		pendingReminderAt: nullableNumber(value.pendingReminderAt),
		updatedAt: finiteOr(value.updatedAt, now),
	};
}

export function readPreferences(userId: string | number, storage = browserStorage()) {
	return normalizePreferences(parse<ReminderPreferences>(storage?.getItem(preferencesKey(userId))));
}

export function readProgress(userId: string | number, now = Date.now(), storage = browserStorage()) {
	return normalizeProgress(parse<ActiveTimeProgress>(storage?.getItem(progressKey(userId))), now);
}

function write(key: string, value: unknown, storage: StorageLike | null) {
	if (!storage) return;
	try {
		storage.setItem(key, JSON.stringify(value));
	} catch {
		// Storage full or blocked: tracking degrades to in-memory for this session.
	}
	if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: key }));
}

export function writePreferences(userId: string | number, preferences: ReminderPreferences, storage = browserStorage()) {
	write(preferencesKey(userId), preferences, storage);
}

export function writeProgress(userId: string | number, progress: ActiveTimeProgress, storage = browserStorage()) {
	write(progressKey(userId), progress, storage);
}

/** Notifies on changes from this tab (custom event) and other tabs (storage event). */
export function subscribeToKey(key: string, onChange: () => void) {
	if (typeof window === "undefined") return () => {};
	const onStorage = (event: StorageEvent) => {
		if (event.key === key || event.key === null) onChange();
	};
	const onLocal = (event: Event) => {
		if ((event as CustomEvent<string>).detail === key) onChange();
	};
	window.addEventListener("storage", onStorage);
	window.addEventListener(CHANGE_EVENT, onLocal);
	return () => {
		window.removeEventListener("storage", onStorage);
		window.removeEventListener(CHANGE_EVENT, onLocal);
	};
}

/**
 * Serialises read-modify-write across tabs with the Web Locks API when available.
 * Falls back to a direct call (only the owning foreground tab writes time anyway).
 */
export function withProgressLock(userId: string | number, task: () => void): Promise<void> {
	const locks = typeof navigator !== "undefined" ? (navigator as Navigator & { locks?: LockManager }).locks : undefined;
	if (!locks?.request) {
		task();
		return Promise.resolve();
	}
	return locks.request(`${STORAGE_PREFIX}:${userId}`, () => task()).then(() => undefined);
}
