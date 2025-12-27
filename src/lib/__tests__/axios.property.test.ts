import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fc from "fast-check";
import axios, { AxiosError } from "axios";
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

describe("Axios Property Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLocation.href = "";
	});

	afterEach(() => {
		localStorageMock.getItem.mockClear();
		localStorageMock.removeItem.mockClear();
	});

	/**
	 * Property 5: Axios Request Interceptor Adds Auth Token
	 * Feature: phase-0-infrastructure, Property 5: For any HTTP request made through the configured Axios instance, IF a valid auth token exists in localStorage, THEN the request headers SHALL include Authorization: Bearer {token}
	 * Validates: Requirements 10.2
	 */
	it("should add Bearer token to request headers when token exists in localStorage", () => {
		fc.assert(
			fc.property(
				fc.string({ minLength: 10, maxLength: 100 }).filter((token) => token.trim().length > 0), // Generate random non-whitespace tokens
				async (token) => {
					// Setup: Mock localStorage to return the token
					localStorageMock.getItem.mockReturnValue(token);

					// Create a spy on axios.request to intercept the actual request
					const requestSpy = vi.spyOn(axios, "request").mockResolvedValue({
						data: {},
						status: 200,
						statusText: "OK",
						headers: {},
						config: {},
					});

					try {
						// Make a request through our configured api instance
						await api.get("/test");

						// Verify the request was made with the Authorization header
						expect(requestSpy).toHaveBeenCalledWith(
							expect.objectContaining({
								headers: expect.objectContaining({
									Authorization: `Bearer ${token}`,
								}),
							})
						);
					} finally {
						// Restore the spy
						requestSpy.mockRestore();
					}
				}
			),
			{ numRuns: 100 }
		);
	});

	it("should not add Authorization header when no token exists in localStorage", () => {
		fc.assert(
			fc.property(
				fc.oneof(
					fc.constant(null), // No token
					fc.constant(""), // Empty string
					fc.string().filter((s) => s.trim().length === 0) // Whitespace-only strings
				),
				async (token) => {
					// Setup: Mock localStorage to return the invalid token
					localStorageMock.getItem.mockReturnValue(token);

					// Create a spy on axios.request to intercept the actual request
					const requestSpy = vi.spyOn(axios, "request").mockResolvedValue({
						data: {},
						status: 200,
						statusText: "OK",
						headers: {},
						config: {},
					});

					try {
						// Make a request through our configured api instance
						await api.get("/test");

						// Verify the request was made without Authorization header
						const callArgs = requestSpy.mock.calls[0][0];
						expect(callArgs.headers).not.toHaveProperty("Authorization");
					} finally {
						// Restore the spy
						requestSpy.mockRestore();
					}
				}
			),
			{ numRuns: 100 }
		);
	});

	/**
	 * Property 6: Axios Response Interceptor Handles 401
	 * Feature: phase-0-infrastructure, Property 6: For any HTTP response with status code 401 received through the configured Axios instance, the interceptor SHALL clear the stored auth token and redirect to the login page
	 * Validates: Requirements 10.3, 10.4
	 */
	it("should clear token and redirect on 401 response", () => {
		fc.assert(
			fc.property(
				fc.string({ minLength: 10, maxLength: 100 }).filter((token) => token.trim().length > 0), // Generate random non-whitespace tokens
				async (token) => {
					// Setup: Mock localStorage to have a token initially
					localStorageMock.getItem.mockReturnValue(token);

					// Create a spy on axios.request that rejects with 401
					const requestSpy = vi.spyOn(axios, "request").mockRejectedValue({
						response: {
							status: 401,
							statusText: "Unauthorized",
							data: { message: "Unauthorized" },
						},
						config: {},
						isAxiosError: true,
					} as AxiosError);

					try {
						// Make a request that will return 401
						await api.get("/test").catch(() => {
							// Expected to throw due to 401
						});

						// Verify localStorage.removeItem was called
						expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_token");

						// Verify redirect to login
						expect(mockLocation.href).toBe("/login");
					} finally {
						// Restore the spy
						requestSpy.mockRestore();
					}
				}
			),
			{ numRuns: 100 }
		);
	});

	it("should not clear token or redirect on non-401 responses", () => {
		fc.assert(
			fc.property(
				fc.string({ minLength: 10, maxLength: 100 }).filter((token) => token.trim().length > 0), // Generate random non-whitespace tokens
				fc.integer({ min: 400, max: 599 }).filter((status) => status !== 401), // Generate non-401 error status codes
				async (token, errorStatus) => {
					// Setup: Mock localStorage to have a token initially
					localStorageMock.getItem.mockReturnValue(token);

					// Create a spy on axios.request that rejects with the error status
					const requestSpy = vi.spyOn(axios, "request").mockRejectedValue({
						response: {
							status: errorStatus,
							statusText: "Error",
							data: { message: "Error" },
						},
						config: {},
						isAxiosError: true,
					} as AxiosError);

					try {
						// Make a request that will return the error status
						await api.get("/test").catch(() => {
							// Expected to throw due to error
						});

						// Verify localStorage.removeItem was NOT called
						expect(localStorageMock.removeItem).not.toHaveBeenCalledWith("auth_token");

						// Verify no redirect occurred
						expect(mockLocation.href).toBe("");
					} finally {
						// Restore the spy
						requestSpy.mockRestore();
					}
				}
			),
			{ numRuns: 100 }
		);
	});
});
