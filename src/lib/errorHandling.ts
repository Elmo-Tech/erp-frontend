/**
 * Error Handling Utilities
 *
 * Centralized error handling, logging, and reporting utilities.
 */

import { toast } from "sonner";

const reportedErrors = new WeakSet<object>();

/** One owner per rejected request, even when both the interceptor and a form handle it. */
export function notifyApiError(error: unknown): void {
	if (typeof error === "object" && error !== null) {
		if (reportedErrors.has(error)) return;
		reportedErrors.add(error);
	}
	const message = handleApiError(error);
	toast.error(message, { id: `api-error:${message}` });
}

export interface ErrorLog {
	message: string;
	stack?: string;
	timestamp: string;
	url: string;
	userAgent: string;
	userId?: string;
	context?: Record<string, unknown>;
}

/**
 * Log error to external service (Sentry, Bugsnag, etc.)
 */
export function logError(error: Error, context?: Record<string, unknown>): void {
	const errorLog: ErrorLog = {
		message: error.message,
		stack: error.stack,
		timestamp: new Date().toISOString(),
		url: typeof window !== "undefined" ? window.location.href : "",
		userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
		context,
	};

	// Log to console in development
	if (process.env.NODE_ENV === "development") {
		console.error("Error logged:", errorLog);
	}

	// TODO: Send to error tracking service
	// Example with Sentry:
	// Sentry.captureException(error, {
	//   contexts: {
	//     custom: context,
	//   },
	// });

	// Example with custom API:
	// fetch("/api/errors", {
	//   method: "POST",
	//   headers: { "Content-Type": "application/json" },
	//   body: JSON.stringify(errorLog),
	// }).catch(console.error);
}

/**
 * Handle API errors with user-friendly messages
 */
export function handleApiError(error: unknown): string {
	// Axios errors
	if (typeof error === "object" && error !== null && "response" in error) {
		const axiosError = error as {
			response?: {
				status: number;
				data?: { message?: string; errors?: Record<string, string[]> };
			};
		};

		if (axiosError.response) {
			const { status, data } = axiosError.response;

			// Validation errors (422)
			if (status === 422 && data?.errors) {
				const firstError = Object.values(data.errors)[0];
				return Array.isArray(firstError) ? firstError[0] : "Validation error";
			}

			if (data?.message) {
				return data.message;
			}

			// Unauthorized (401)
			if (status === 401) {
				return "Session expired. Please login again.";
			}

			// Forbidden (403)
			if (status === 403) {
				return "You don't have permission to perform this action.";
			}

			// Not found (404)
			if (status === 404) {
				return "Resource not found.";
			}

			// Server errors (500+)
			if (status >= 500) {
				return "Server error. Please try again later.";
			}
		}
	}

	if (error instanceof Error) {
		// Network errors
		if (error.message.includes("Network") || error.message.includes("fetch")) {
			return "Network error. Please check your internet connection.";
		}

		// Timeout errors
		if (error.message.includes("timeout")) {
			return "Request timed out. Please try again.";
		}

		// Default error message
		return error.message;
	}

	return "An unexpected error occurred. Please try again.";
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
	let lastError: Error;

	for (let i = 0; i < maxRetries; i++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			// Don't retry on client errors (4xx)
			if (typeof error === "object" && error !== null && "response" in error && typeof (error as { response?: { status: number } }).response?.status === "number") {
				const status = (error as { response: { status: number } }).response.status;
				if (status >= 400 && status < 500) {
					throw error;
				}
			}

			// Wait before retrying (exponential backoff)
			if (i < maxRetries - 1) {
				const delay = baseDelay * Math.pow(2, i);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	throw lastError!;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
	try {
		return JSON.parse(json) as T;
	} catch (error) {
		logError(error instanceof Error ? error : new Error("JSON parse error"), {
			json,
		});
		return fallback;
	}
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(fn: T, context?: Record<string, unknown>): T {
	return (async (...args: unknown[]) => {
		try {
			return await fn(...args);
		} catch (error) {
			logError(error instanceof Error ? error : new Error(String(error)), context);
			throw error;
		}
	}) as T;
}

/**
 * Check if error is a specific type
 */
export function isNetworkError(error: unknown): boolean {
	if (error instanceof Error) {
		return error.message.includes("Network") || error.message.includes("fetch") || error.message.includes("ECONNREFUSED");
	}
	return false;
}

export function isAuthError(error: unknown): boolean {
	if (typeof error === "object" && error !== null && "response" in error) {
		const status = (error as { response?: { status: number } }).response?.status;
		return status === 401 || status === 403;
	}
	return false;
}

export function isValidationError(error: unknown): boolean {
	if (typeof error === "object" && error !== null && "response" in error) {
		const status = (error as { response?: { status: number } }).response?.status;
		return status === 422;
	}
	return false;
}
