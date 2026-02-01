/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Utility functions for formatting numbers and currency
 */

/**
 * Safely format a number to fixed decimal places
 * Handles null, undefined, and non-numeric values
 */
export function safeToFixed(value: any, decimals: number = 2): string {
	const num = Number(value);
	if (isNaN(num)) return "0.00";
	return num.toFixed(decimals);
}

/**
 * Format currency with proper handling of null/undefined values
 */
export function formatCurrency(value: any, currency: string = "USD"): string {
	const num = Number(value);
	if (isNaN(num)) return "$0.00";

	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
	}).format(num);
}

/**
 * Format percentage with safe handling
 */
export function formatPercentage(value: any, decimals: number = 1): string {
	const num = Number(value);
	if (isNaN(num)) return "0%";
	return `${num.toFixed(decimals)}%`;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: any, decimals: number = 0): string {
	const num = Number(value);
	if (isNaN(num)) return "0";

	return new Intl.NumberFormat("en-US", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(num);
}
