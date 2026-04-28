import { parseDateTime } from "./dateUtils";

const TRACKABLE_LABELS: Record<string, string> = {
	lead: "Lead",
	quotation: "Quotation",
	task: "Task",
};

export function clampFiniteNumber(value: number, fallback = 0) {
	return Number.isFinite(value) ? Math.max(0, value) : fallback;
}

export function getElapsedSeconds(startTime: string | null | undefined, now = Date.now()) {
	const startDate = parseDateTime(startTime);

	if (!startDate) {
		return 0;
	}

	return clampFiniteNumber(Math.floor((now - startDate.getTime()) / 1000));
}

export function getElapsedMinutes(startTime: string | null | undefined, now = Date.now()) {
	return Math.floor(getElapsedSeconds(startTime, now) / 60);
}

export function formatSecondsClock(seconds: number) {
	const safeSeconds = clampFiniteNumber(Math.floor(seconds));
	const hours = Math.floor(safeSeconds / 3600);
	const minutes = Math.floor((safeSeconds % 3600) / 60);
	const remainingSeconds = safeSeconds % 60;

	if (hours > 0) {
		return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
	}

	return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function formatMinutesCompact(minutes: number | null | undefined) {
	const safeMinutes = clampFiniteNumber(Math.round(minutes ?? 0));
	const hours = Math.floor(safeMinutes / 60);
	const remainingMinutes = safeMinutes % 60;

	if (hours === 0) {
		return `${remainingMinutes}m`;
	}

	if (remainingMinutes === 0) {
		return `${hours}h`;
	}

	return `${hours}h ${remainingMinutes}m`;
}

export function normalizeTrackableType(type: string) {
	const normalized = type.split("\\").pop()?.toLowerCase() ?? type.toLowerCase();

	return normalized;
}

export function getTrackableTypeLabel(type: string) {
	const normalized = normalizeTrackableType(type);

	return TRACKABLE_LABELS[normalized] ?? "Work item";
}

export function toApiTrackableType(type: string) {
	const normalized = normalizeTrackableType(type);

	if (normalized === "task") {
		return "App\\Models\\Task";
	}

	if (normalized === "lead") {
		return "App\\Models\\Lead";
	}

	if (normalized === "quotation") {
		return "App\\Models\\Quotation";
	}

	return type;
}

