import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const LOGIN_ROUTE = "/login";
const AUTH_TOKEN_KEY = "auth_token";
const AUTH_STORAGE_KEY = "auth-storage";

interface PersistedAuthStorage {
	state?: {
		token?: string | null;
		tokenExpiresAt?: string | null;
	};
}

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

function getAuthToken() {
	if (!isBrowser()) {
		return null;
	}

	return localStorage.getItem(AUTH_TOKEN_KEY) ?? readPersistedAuth()?.state?.token ?? null;
}

function isTokenExpired(tokenExpiresAt: string | null | undefined) {
	if (!tokenExpiresAt) {
		return false;
	}

	const expiresAt = new Date(tokenExpiresAt).getTime();
	return Number.isFinite(expiresAt) && expiresAt < Date.now();
}

export function clearClientAuthState() {
	if (!isBrowser()) {
		return;
	}

	localStorage.removeItem(AUTH_TOKEN_KEY);
	localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function redirectToLogin() {
	if (!isBrowser()) {
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
	const persistedAuth = readPersistedAuth();

	if (isTokenExpired(persistedAuth?.state?.tokenExpiresAt)) {
		clearClientAuthState();
		redirectToLogin();
		return Promise.reject(new Error("Token expired"));
	}

	const token = getAuthToken();

	if (token?.trim() && config.headers) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	if (config.headers) {
		config.headers["Accept-Language"] = "en";
	}

	return config;
};

export const handleApiRequestError = (error: AxiosError) => Promise.reject(error);

export const handleApiResponse = (response: AxiosResponse) => response;

export const handleApiResponseError = (error: AxiosError) => {
	if (error.response?.status === 401) {
		clearClientAuthState();
		redirectToLogin();
	}

	return Promise.reject(error);
};

api.interceptors.request.use(handleApiRequest, handleApiRequestError);
api.interceptors.response.use(handleApiResponse, handleApiResponseError);

export default api;
