import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { api } from "../axios";

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
});

// Mock window.location
const mockLocation = {
	href: "",
};

Object.defineProperty(window, "location", {
	value: mockLocation,
	writable: true,
});

describe("Axios Interceptors", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLocation.href = "";
	});

	afterEach(() => {
		localStorageMock.getItem.mockClear();
		localStorageMock.removeItem.mockClear();
	});

	describe("Request Interceptor", () => {
		it("should add Bearer token to request headers when token exists in localStorage", () => {
			const token = "test-token-123";
			localStorageMock.getItem.mockReturnValue(token);

			// Test the request interceptor directly
			const requestInterceptor = api.interceptors.request.handlers[0];
			const config = {
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			};

			const result = requestInterceptor.fulfilled(config);

			expect(localStorageMock.getItem).toHaveBeenCalledWith("auth_token");
			expect(result.headers.Authorization).toBe(`Bearer ${token}`);
		});

		it("should not add Authorization header when no token exists in localStorage", () => {
			localStorageMock.getItem.mockReturnValue(null);

			// Test the request interceptor directly
			const requestInterceptor = api.interceptors.request.handlers[0];
			const config = {
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			};

			const result = requestInterceptor.fulfilled(config);

			expect(localStorageMock.getItem).toHaveBeenCalledWith("auth_token");
			expect(result.headers).not.toHaveProperty("Authorization");
		});
	});

	describe("Response Interceptor", () => {
		it("should clear token and redirect on 401 response", () => {
			const token = "test-token-123";
			localStorageMock.getItem.mockReturnValue(token);

			// Test the response interceptor directly
			const responseInterceptor = api.interceptors.response.handlers[0];
			const error = {
				response: {
					status: 401,
					statusText: "Unauthorized",
					data: { message: "Unauthorized" },
				},
				config: {},
				isAxiosError: true,
			};

			// The interceptor should reject the promise, so we expect it to throw
			expect(() => responseInterceptor.rejected(error)).rejects.toEqual(error);

			// Verify localStorage.removeItem was called
			expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_token");

			// Verify redirect to login
			expect(mockLocation.href).toBe("/login");
		});

		it("should not clear token or redirect on non-401 responses", () => {
			const token = "test-token-123";
			localStorageMock.getItem.mockReturnValue(token);

			// Test the response interceptor directly
			const responseInterceptor = api.interceptors.response.handlers[0];
			const error = {
				response: {
					status: 400,
					statusText: "Bad Request",
					data: { message: "Bad Request" },
				},
				config: {},
				isAxiosError: true,
			};

			// The interceptor should reject the promise, so we expect it to throw
			expect(() => responseInterceptor.rejected(error)).rejects.toEqual(error);

			// Verify localStorage.removeItem was NOT called
			expect(localStorageMock.removeItem).not.toHaveBeenCalledWith("auth_token");

			// Verify no redirect occurred
			expect(mockLocation.href).toBe("");
		});

		it("should pass through successful responses", () => {
			const response = {
				data: { message: "success" },
				status: 200,
				statusText: "OK",
				headers: {},
				config: {},
			};

			// Test the response interceptor directly
			const responseInterceptor = api.interceptors.response.handlers[0];
			const result = responseInterceptor.fulfilled(response);

			expect(result).toEqual(response);
			expect(localStorageMock.removeItem).not.toHaveBeenCalled();
			expect(mockLocation.href).toBe("");
		});
	});
});
