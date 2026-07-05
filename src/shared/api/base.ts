import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { useAuthStore, type Permission, type User } from "@/entities/user/model/auth.store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const LOGIN_ROUTE = "/login";
const AUTH_STORAGE_KEY = "auth-storage";
const REFRESH_WINDOW_MS = 5 * 60 * 1000;
const CSRF_COOKIE = "csrf_token";

interface PersistedAuthStorage {
	state?: {
		tokenExpiresAt?: string | null;
	};
}

interface RefreshResponse {
	data: {
		tokenDetails: {
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

function isAuthEndpoint(url: string | undefined) {
	return url?.includes("/auth/login") || url?.includes("/auth/refresh");
}

export function clearClientAuthState() {
	if (!isBrowser()) {
		return;
	}

	localStorage.removeItem(AUTH_STORAGE_KEY);
	Cookies.remove("auth_token", { path: "/" });
	Cookies.remove(CSRF_COOKIE, { path: "/" });
}

export function redirectToLogin() {
	if (!isBrowser()) {
		return;
	}

	window.location.assign(LOGIN_ROUTE);
}

function refreshAuthToken() {
	if (!isBrowser()) {
		return Promise.resolve(null);
	}

	if (refreshPromise) {
		return refreshPromise;
	}

	if (!Cookies.get(CSRF_COOKIE)) {
		clearClientAuthState();
		return Promise.resolve(null);
	}

	refreshPromise = axios
		.post<RefreshResponse>(
			`${API_BASE_URL}/auth/refresh`,
			{},
			{
				withCredentials: true,
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					...csrfHeader(),
				},
			},
		)
		.then((response) => {
			const { tokenDetails, profile, role, permissions } = response.data.data;

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

			return "cookie-session";
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
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

export const handleApiRequest = async (config: InternalAxiosRequestConfig) => {
	const persistedAuth = readPersistedAuth();

	if (!isAuthEndpoint(config.url) && isTokenExpired(persistedAuth?.state?.tokenExpiresAt)) {
		const token = await refreshAuthToken();
		if (!token) {
			redirectToLogin();
			return Promise.reject(new Error("Token expired"));
		}
	}

	if (!isAuthEndpoint(config.url) && !isTokenExpired(persistedAuth?.state?.tokenExpiresAt) && shouldRefreshToken(persistedAuth?.state?.tokenExpiresAt)) {
		await refreshAuthToken();
	}

	if (config.headers) {
		config.headers["Accept-Language"] = "en";
		const csrf = csrfHeader();
		for (const [key, value] of Object.entries(csrf)) {
			config.headers[key] = value;
		}
	}

	return config;
};

export const handleApiRequestError = (error: AxiosError) => Promise.reject(error);

export const handleApiResponse = (response: AxiosResponse) => response;

export const handleApiResponseError = async (error: AxiosError) => {
	const originalRequest = error.config as RetriableRequestConfig | undefined;
	const isAuthRequest = isAuthEndpoint(originalRequest?.url);

	if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
		originalRequest._retry = true;
		const token = await refreshAuthToken();

		if (token) {
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

function csrfHeader(): Record<string, string> {
	const csrfToken = Cookies.get(CSRF_COOKIE);

	return csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};
}
