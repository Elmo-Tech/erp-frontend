import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";
import { useLocaleStore } from "@/store/localeStore";
import { notifyApiError } from "@/lib/errorHandling";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const LOGIN_ROUTE = "/login";
let nextRateLimitToastAt = 0;

declare module "axios" {
	export interface AxiosRequestConfig {
		/** Skip the global error toast (for polling/background requests). */
		skipErrorToast?: boolean;
		/** Background requests and custom rich-success flows own their feedback. */
		skipSuccessToast?: boolean;
	}
}

function getRetryAfterSeconds(error: AxiosError): number | null {
	const rawValue = error.response?.headers?.["retry-after"];

	if (typeof rawValue === "number") {
		return Math.max(1, Math.ceil(rawValue));
	}

	if (typeof rawValue !== "string") {
		return null;
	}

	const seconds = Number(rawValue);
	if (Number.isFinite(seconds)) {
		return Math.max(1, Math.ceil(seconds));
	}

	const retryDate = Date.parse(rawValue);
	return Number.isNaN(retryDate) ? null : Math.max(1, Math.ceil((retryDate - Date.now()) / 1000));
}

function clearClientAuthState() {
	if (typeof window === "undefined") {
		return;
	}

	localStorage.removeItem("auth_token");
	localStorage.removeItem("auth-storage");
	useAuthStore.getState().logout();
	if ("serviceWorker" in navigator) {
		void navigator.serviceWorker.getRegistration("/push-sw.js")
			.then((registration) => registration?.pushManager.getSubscription())
			.then((subscription) => subscription?.unsubscribe())
			.catch(() => undefined);
	}
}

function redirectToLogin() {
	if (typeof window === "undefined") {
		return;
	}

	window.location.assign(LOGIN_ROUTE);
}

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

export const handleApiRequest = (config: InternalAxiosRequestConfig) => {
	const isLoginRequest = config.url?.split("?")[0]?.endsWith("/auth/login");
	// Let the browser supply the multipart boundary. The JSON default otherwise
	// serializes FormData into JSON and Laravel never receives the uploaded file.
	if (typeof FormData !== "undefined" && config.data instanceof FormData) {
		config.headers.delete("Content-Type");
	}

	const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

	// Check if auth-storage exists and validate token expiry
	if (typeof window !== "undefined") {
		const authStorage = localStorage.getItem("auth-storage");
		if (authStorage) {
			try {
				const { state } = JSON.parse(authStorage);
				if (state?.tokenExpiresAt) {
					const expiresAt = new Date(state.tokenExpiresAt);
					const now = new Date();

					// If token is expired, clear everything and redirect
					if (expiresAt < now) {
						clearClientAuthState();
						if (!isLoginRequest) {
							redirectToLogin();
							return Promise.reject(new Error("Token expired"));
						}
					}
				}
			} catch {
				// If parsing fails, clear storage
				clearClientAuthState();
			}
		}
	}

	// Only add token if it exists and is not just whitespace
	if (!isLoginRequest && token && token.trim() && config.headers) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	// Add Accept-Language header
	if (config.headers) {
		config.headers["Accept-Language"] = useLocaleStore.getState().locale;
	}

	return config;
};

export const handleApiRequestError = (error: AxiosError) => Promise.reject(error);

export const handleApiResponse = (response: AxiosResponse) => {
	// Convention: the interceptor owns generic CRUD success toasts from the
	// backend `message` field. Components must NOT toast the same success
	// again (that produced the duplicate/triple toasts). Components keep
	// only special-case toasts (warnings, info, custom flows).
	// Endpoints that return a bare `{ data }` shape stay silent here, so
	// their components keep their own success toast.
	const method = response.config.method?.toLowerCase();
	const message = typeof response.data?.message === "string" ? response.data.message : null;

	if (message && method && method !== "get" && !response.config.skipSuccessToast) {
		toast.success(message);
	}

	return response;
};

export const handleApiResponseError = (error: AxiosError) => {
	const isLoginRequest = error.config?.url?.split("?")[0]?.endsWith("/auth/login");
	if (error.response?.status === 401 && !isLoginRequest) {
		clearClientAuthState();
		redirectToLogin();
	}

	// Polling/background requests opt out of the global error toast so a
	// dead session or flaky network does not spam the user. Pass
	// { skipErrorToast: true } in the request config.
	const skipErrorToast = (error.config as { skipErrorToast?: boolean } | undefined)?.skipErrorToast === true;
	if (skipErrorToast) {
		return Promise.reject(error);
	}

	if (error.response?.status === 429) {
		const retryAfter = getRetryAfterSeconds(error);
		const now = Date.now();

		if (now >= nextRateLimitToastAt) {
			toast.error("Too many requests", {
				description: retryAfter ? `Please wait ${retryAfter} seconds, then try again.` : "Please wait a moment, then try again.",
			});
			nextRateLimitToastAt = now + Math.max(5, retryAfter ?? 5) * 1000;
		}
	} else {
		notifyApiError(error);
	}

	return Promise.reject(error);
};

// Request interceptor - Add auth token
api.interceptors.request.use(handleApiRequest, handleApiRequestError);

// Response interceptor - Handle 401
api.interceptors.response.use(handleApiResponse, handleApiResponseError);

export default api;
