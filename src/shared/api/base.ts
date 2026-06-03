import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { useAuthStore, type Permission, type User } from "@/entities/user/model/auth.store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const LOGIN_ROUTE = "/login";
const AUTH_STORAGE_KEY = "auth-storage";
const REFRESH_WINDOW_MS = 5 * 60 * 1000;

interface PersistedAuthStorage {
	state?: {
		tokenExpiresAt?: string | null;
	};
}

interface RefreshResponse {
	data: {
		tokenDetails: {
			token?: string;
			expiresIn: number;
		};
		profile: {
			userId: number;
			name: string;
			email: string;
			avatar: string;
		};
		role: string;
		permissions: Permission[];
	};
}

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

function isBrowser() {
	return typeof window !== "undefined";
}

function readPersistedAuth(): PersistedAuthStorage | null {
	if (!isBrowser()) {
		return null;
	}

	const authStorage = localStorage.getItem(AUTH_STORAGE_KEY);
	if (!authStorage) {
		return null;
	}

	try {
		return JSON.parse(authStorage) as PersistedAuthStorage;
	} catch {
		clearClientAuthState();
		return null;
	}
}

function isTokenExpired(tokenExpiresAt: string | null | undefined) {
	if (!tokenExpiresAt) {
		return false;
	}

	const expiresAt = new Date(tokenExpiresAt).getTime();
	return Number.isFinite(expiresAt) && expiresAt < Date.now();
}

function shouldRefreshToken(tokenExpiresAt: string | null | undefined) {
	if (!tokenExpiresAt) {
		return false;
	}

	const expiresAt = new Date(tokenExpiresAt).getTime();
	return Number.isFinite(expiresAt) && expiresAt - Date.now() <= REFRESH_WINDOW_MS;
}

export function clearClientAuthState() {
	if (!isBrowser()) {
		return;
	}

	localStorage.removeItem(AUTH_STORAGE_KEY);
	Cookies.remove("auth_token", { path: "/" });
}

export function redirectToLogin() {
	if (!isBrowser()) {
		return;
	}

	window.location.assign(LOGIN_ROUTE);
}

function cookieExpiryDate(expiresInMinutes: number) {
	return new Date(Date.now() + expiresInMinutes * 60 * 1000);
}

function refreshAuthToken() {
	if (!isBrowser()) {
		return Promise.resolve(null);
	}

	if (refreshPromise) {
		return refreshPromise;
	}

	const currentToken = Cookies.get("auth_token");
	if (!currentToken) {
		return Promise.resolve(null);
	}

	refreshPromise = axios
		.post<RefreshResponse>(
			`${API_BASE_URL}/auth/refresh`,
			{},
			{
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					Authorization: `Bearer ${currentToken}`,
				},
			},
		)
		.then((response) => {
			const { tokenDetails, profile, role, permissions } = response.data.data;
			const token = tokenDetails.token;

			if (!token) {
				throw new Error("Refresh response did not include an auth token");
			}

			Cookies.set("auth_token", token, {
				expires: cookieExpiryDate(tokenDetails.expiresIn),
				path: "/",
			});

			useAuthStore.getState().refreshAuth({
				user: {
					userId: profile.userId,
					name: profile.name,
					email: profile.email,
					avatar: profile.avatar,
					role,
				} satisfies User,
				expiresIn: tokenDetails.expiresIn,
				role,
				permissions,
			});

			return token;
		})
		.catch(() => {
			clearClientAuthState();
			return null;
		})
		.finally(() => {
			refreshPromise = null;
		});

	return refreshPromise;
}

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

export const handleApiRequest = async (config: InternalAxiosRequestConfig) => {
	const persistedAuth = readPersistedAuth();

	if (isTokenExpired(persistedAuth?.state?.tokenExpiresAt)) {
		const token = await refreshAuthToken();
		if (!token) {
			redirectToLogin();
			return Promise.reject(new Error("Token expired"));
		}
	}

	if (!isTokenExpired(persistedAuth?.state?.tokenExpiresAt) && shouldRefreshToken(persistedAuth?.state?.tokenExpiresAt)) {
		await refreshAuthToken();
	}

	if (config.headers) {
		config.headers["Accept-Language"] = "en";

		const token = Cookies.get("auth_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}

	return config;
};

export const handleApiRequestError = (error: AxiosError) => Promise.reject(error);

export const handleApiResponse = (response: AxiosResponse) => response;

export const handleApiResponseError = async (error: AxiosError) => {
	const originalRequest = error.config as RetriableRequestConfig | undefined;
	const isAuthRequest = originalRequest?.url?.includes("/auth/login") || originalRequest?.url?.includes("/auth/refresh");

	if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
		originalRequest._retry = true;
		const token = await refreshAuthToken();

		if (token) {
			originalRequest.headers.Authorization = `Bearer ${token}`;
			return api(originalRequest);
		}
	}

	if (error.response?.status === 401 && !isAuthRequest) {
		clearClientAuthState();
		redirectToLogin();
	}

	return Promise.reject(error);
};

api.interceptors.request.use(handleApiRequest, handleApiRequestError);
api.interceptors.response.use(handleApiResponse, handleApiResponseError);

export default api;
