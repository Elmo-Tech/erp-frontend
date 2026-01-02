/**
 * Shared Formatters
 * Utility functions for formatting data consistently across the app
 */

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = "USD", options?: Intl.NumberFormatOptions): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
		...options,
	}).format(amount);
}

/**
 * Format currency without decimals
 */
export function formatCurrencyCompact(amount: number, currency: string = "USD"): string {
	return formatCurrency(amount, currency, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	});
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
	if (!dateString) return "-";

	const date = typeof dateString === "string" ? new Date(dateString) : dateString;

	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		...options,
	});
}

/**
 * Format date with time
 */
export function formatDateTime(dateString: string | Date | null | undefined): string {
	return formatDate(dateString, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

/**
 * Format date to long format
 */
export function formatDateLong(dateString: string | Date | null | undefined): string {
	return formatDate(dateString, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string | Date): string {
	const date = typeof dateString === "string" ? new Date(dateString) : dateString;
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSecs < 60) return "just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;

	return formatDate(date);
}

/**
 * Format time duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
	if (minutes < 60) {
		return `${minutes}m`;
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (remainingMinutes === 0) {
		return `${hours}h`;
	}

	return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format hours to readable string
 */
export function formatHours(hours: number): string {
	if (hours === 0) return "0h";
	if (hours < 1) return `${Math.round(hours * 60)}m`;
	return `${hours}h`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
	return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number, decimals: number = 0): string {
	return new Intl.NumberFormat("en-US", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength)}...`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";

	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
