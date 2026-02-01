import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";

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
			// Clear token and redirect to login
			if (typeof window !== "undefined") {
				localStorage.removeItem("auth_token");
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	},
);

export default api;
