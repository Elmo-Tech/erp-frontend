import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

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

// Request interceptor - Add auth token
api.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
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
			config.headers["Accept-Language"] = "en";
		}

		return config;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	},
);

// Response interceptor - Handle 401
api.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		if (error.response?.status === 401) {
			clearClientAuthState();
			redirectToLogin();
		}
		return Promise.reject(error);
	},
);

export default api;
