import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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
							localStorage.removeItem("auth_token");
							localStorage.removeItem("auth-storage");
							window.location.href = "/login";
							return Promise.reject(new Error("Token expired"));
						}
					}
				} catch {
					// If parsing fails, clear storage
					localStorage.removeItem("auth_token");
					localStorage.removeItem("auth-storage");
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
			// Clear all auth data and redirect to login
			if (typeof window !== "undefined") {
				// Clear localStorage
				localStorage.removeItem("auth_token");
				localStorage.removeItem("auth-storage");

				// Clear Zustand store by reloading (this ensures clean state)
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	},
);

export default api;
