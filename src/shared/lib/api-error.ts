import { isAxiosError } from "axios";

interface ApiErrorResponse {
	message?: string;
	error?: string;
	errors?: Record<string, string[]>;
}

function flattenValidationErrors(errors: Record<string, string[]> | undefined) {
	return Object.values(errors ?? {})
		.flat()
		.filter(Boolean);
}

export function getApiErrorMessage(error: unknown, fallback: string) {
	if (isAxiosError<ApiErrorResponse>(error)) {
		const validationErrors = flattenValidationErrors(error.response?.data?.errors);
		if (validationErrors.length > 0) {
			return validationErrors.join("\n");
		}

		return error.response?.data?.message ?? error.response?.data?.error ?? error.message ?? fallback;
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	return fallback;
}

export function getApiValidationErrors(error: unknown): Record<string, string[]> {
	if (!isAxiosError<ApiErrorResponse>(error)) {
		return {};
	}

	return error.response?.data?.errors ?? {};
}
