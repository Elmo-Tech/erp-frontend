/**
 * Date and Time Utilities
 *
 * IMPORTANT: Times are stored as local time in the database (no UTC conversion).
 * The server and client should be in the same timezone context.
 */

/**
 * Parse a datetime string from API and return Date object
 * @param dateTimeString - ISO string from API (e.g., "2026-01-07T10:00:00")
 * @returns Date object
 */
export function parseDateTime(dateTimeString: string | null | undefined): Date | null {
	if (!dateTimeString) return null;

	// Parse the datetime string as local time (no Z suffix means local)
	const date = new Date(dateTimeString);

	// Check if valid date
	if (isNaN(date.getTime())) return null;

	return date;
}

/**
 * Format time for display (HH:MM AM/PM format)
 * @param dateTimeString - ISO string from API
 * @returns Formatted time string (e.g., "10:00 AM")
 */
export function formatTimeDisplay(dateTimeString: string | null | undefined): string {
	if (!dateTimeString) return "--:--";

	const date = parseDateTime(dateTimeString);
	if (!date) return "--:--";

	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
}

/**
 * Format time for input field (HH:MM 24-hour format)
 * @param dateTimeString - ISO string from API
 * @returns Time string for input (e.g., "10:00")
 */
export function formatTimeForInput(dateTimeString: string | null | undefined): string {
	if (!dateTimeString) return "";

	const date = parseDateTime(dateTimeString);
	if (!date) return "";

	// Get hours and minutes
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");

	return `${hours}:${minutes}`;
}

/**
 * Format date for display (e.g., "Mon, Jan 7")
 * @param dateString - Date string from API
 * @returns Formatted date string
 */
export function formatDateDisplay(dateString: string | null | undefined): string {
	if (!dateString) return "--";

	const date = new Date(dateString);
	if (isNaN(date.getTime())) return "--";

	return date.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
}

/**
 * Format full datetime for display
 * @param dateTimeString - ISO string from API
 * @returns Formatted datetime string (e.g., "Mon, Jan 7 at 10:00 AM")
 */
export function formatDateTimeDisplay(dateTimeString: string | null | undefined): string {
	if (!dateTimeString) return "--";

	const date = parseDateTime(dateTimeString);
	if (!date) return "--";

	const dateStr = date.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
	});

	const timeStr = date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});

	return `${dateStr} at ${timeStr}`;
}

/**
 * Get elapsed seconds from a start time to now
 * @param startTimeString - ISO string from API
 * @returns Elapsed seconds
 */
export function getElapsedSeconds(startTimeString: string | null | undefined): number {
	if (!startTimeString) return 0;

	const startDate = parseDateTime(startTimeString);
	if (!startDate) return 0;

	const now = new Date();
	const elapsed = Math.floor((now.getTime() - startDate.getTime()) / 1000);

	return Math.max(0, elapsed); // Never return negative
}

/**
 * Format seconds to HH:MM:SS or MM:SS
 * @param seconds - Number of seconds
 * @returns Formatted time string
 */
export function formatDuration(seconds: number): string {
	const absSeconds = Math.abs(seconds);
	const hours = Math.floor(absSeconds / 3600);
	const minutes = Math.floor((absSeconds % 3600) / 60);
	const secs = absSeconds % 60;

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	}
	return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Combine date and time strings for API submission
 * @param dateString - Date string (YYYY-MM-DD)
 * @param timeString - Time string (HH:MM)
 * @returns ISO datetime string WITHOUT timezone conversion (local time)
 */
export function combineDateTimeForAPI(dateString: string, timeString: string): string {
	// Return as local datetime string without UTC conversion
	// Format: YYYY-MM-DDTHH:MM:SS (no Z suffix = local time)
	return `${dateString}T${timeString}:00`;
}

// Legacy function names for backward compatibility
export const parseUTCDateTime = parseDateTime;

// ─────────────────────────────────────────────────────────────────────────────
// Global date formatter — DD/MM/YYYY
//
// This is the canonical display format for all dates across the system.
// Use this in DataTables, cards, and any read-only date display.
//
// Usage:
//   formatDate("2026-05-11")           → "11/05/2026"
//   formatDate("2026-05-11T10:00:00")  → "11/05/2026"
//   formatDate(null)                   → "—"
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format any date string or Date object as DD/MM/YYYY.
 * Returns "—" for null/undefined/invalid inputs.
 */
export function formatDate(value: string | Date | null | undefined): string {
	if (!value) return "—";

	const date = value instanceof Date ? value : new Date(value);

	if (isNaN(date.getTime())) return "—";

	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();

	return `${day}/${month}/${year}`;
}

/**
 * Format any date string or Date object as DD/MM/YYYY HH:MM.
 * Returns "—" for null/undefined/invalid inputs.
 */
export function formatDateTime(value: string | Date | null | undefined): string {
	if (!value) return "—";

	const date = value instanceof Date ? value : new Date(value);

	if (isNaN(date.getTime())) return "—";

	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");

	return `${day}/${month}/${year} ${hours}:${minutes}`;
}
