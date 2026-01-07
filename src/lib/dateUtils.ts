/**
 * Date and Time Utilities
 *
 * CRITICAL: All times are stored in UTC in the database.
 * These utilities handle proper conversion to user's local timezone for display.
 */

/**
 * Parse a datetime string from API (UTC) and return local Date object
 * @param dateTimeString - ISO string from API (e.g., "2026-01-07T09:47:00.000000Z")
 * @returns Date object in local timezone
 */
export function parseUTCDateTime(dateTimeString: string | null | undefined): Date | null {
	if (!dateTimeString) return null;

	// Parse the UTC datetime string
	const date = new Date(dateTimeString);

	// Check if valid date
	if (isNaN(date.getTime())) return null;

	return date;
}

/**
 * Format time for display (HH:MM AM/PM format in local timezone)
 * @param dateTimeString - ISO string from API
 * @returns Formatted time string (e.g., "09:47 AM")
 */
export function formatTimeDisplay(dateTimeString: string | null | undefined): string {
	if (!dateTimeString) return "--:--";

	const date = parseUTCDateTime(dateTimeString);
	if (!date) return "--:--";

	// Format in local timezone
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
}

/**
 * Format time for input field (HH:MM 24-hour format in local timezone)
 * @param dateTimeString - ISO string from API
 * @returns Time string for input (e.g., "09:47")
 */
export function formatTimeForInput(dateTimeString: string | null | undefined): string {
	if (!dateTimeString) return "";

	const date = parseUTCDateTime(dateTimeString);
	if (!date) return "";

	// Get local hours and minutes
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
 * @returns Formatted datetime string (e.g., "Mon, Jan 7 at 09:47 AM")
 */
export function formatDateTimeDisplay(dateTimeString: string | null | undefined): string {
	if (!dateTimeString) return "--";

	const date = parseUTCDateTime(dateTimeString);
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

	const startDate = parseUTCDateTime(startTimeString);
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
 * @returns ISO datetime string in UTC
 */
export function combineDateTimeForAPI(dateString: string, timeString: string): string {
	// Create date in local timezone
	const [hours, minutes] = timeString.split(":");
	const date = new Date(dateString);
	date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

	// Convert to ISO string (UTC)
	return date.toISOString();
}
