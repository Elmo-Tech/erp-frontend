import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";
import { useLocaleStore } from "@/store/localeStore";
import { handleApiError } from "@/lib/errorHandling";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const LOGIN_ROUTE = "/login";

function clearClientAuthState() {
	if (typeof window === "undefined") {
		return;
	}

	localStorage.removeItem("auth_token");
	localStorage.removeItem("auth-storage");
	useAuthStore.getState().logout();
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
						redirectToLogin();
						return Promise.reject(new Error("Token expired"));
					}
				}
			} catch {
				// If parsing fails, clear storage
				clearClientAuthState();
			}
		}
	}

	// Only add token if it exists and is not just whitespace
	if (token && token.trim() && config.headers) {
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
	const method = response.config.method?.toLowerCase();
	const message = typeof response.data?.message === "string" ? response.data.message : null;

	if (message && method && method !== "get") {
		toast.success(message);
	}

	return response;
};

export const handleApiResponseError = (error: AxiosError) => {
	if (error.response?.status === 401) {
		clearClientAuthState();
		redirectToLogin();
	}

	toast.error(handleApiError(error));

	return Promise.reject(error);
};

// Request interceptor - Add auth token
api.interceptors.request.use(handleApiRequest, handleApiRequestError);

// Response interceptor - Handle 401
api.interceptors.response.use(handleApiResponse, handleApiResponseError);

export default api;
