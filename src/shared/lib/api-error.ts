import { isAxiosError } from "axios";

interface ApiErrorResponse {
	message?: string;
	error?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
	if (isAxiosError<ApiErrorResponse>(error)) {
		return error.response?.data?.message ?? error.response?.data?.error ?? error.message ?? fallback;
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	return fallback;
}
