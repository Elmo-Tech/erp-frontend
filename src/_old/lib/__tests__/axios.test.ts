import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleApiRequest, handleApiResponseError } from "../axios";

const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
};

const assignMock = vi.fn();

Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
});

Object.defineProperty(window, "location", {
	value: {
		assign: assignMock,
	},
	writable: true,
});

describe("Axios Interceptors", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		localStorageMock.getItem.mockReset();
		localStorageMock.removeItem.mockReset();
	});

	describe("Request Interceptor", () => {
		it("adds a bearer token when a valid token exists", async () => {
			localStorageMock.getItem.mockImplementation((key: string) => {
				if (key === "auth_token") return "test-token-123";
				return null;
			});

			const config = await handleApiRequest({
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			} as never);

			expect(config.headers.Authorization).toBe("Bearer test-token-123");
			expect(config.headers["Accept-Language"]).toBe("en");
		});

		it("clears auth and rejects when the persisted token is expired", async () => {
			localStorageMock.getItem.mockImplementation((key: string) => {
				if (key === "auth_token") return "expired-token";
				if (key === "auth-storage") {
					return JSON.stringify({
						state: {
							tokenExpiresAt: "2000-01-01T00:00:00.000Z",
						},
					});
				}
				return null;
			});

			await expect(
				handleApiRequest({
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				} as never)
			).rejects.toThrow("Token expired");

			expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_token");
			expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth-storage");
			expect(assignMock).toHaveBeenCalledWith("/login");
		});
	});

	describe("Response Interceptor", () => {
		it("clears auth state and redirects on 401 responses", async () => {
			const error = {
				response: {
					status: 401,
				},
			};

			await expect(handleApiResponseError(error as never)).rejects.toEqual(error);

			expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_token");
			expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth-storage");
			expect(assignMock).toHaveBeenCalledWith("/login");
		});

		it("does not clear auth state for non-401 responses", async () => {
			const error = {
				response: {
					status: 400,
				},
			};

			await expect(handleApiResponseError(error as never)).rejects.toEqual(error);

			expect(localStorageMock.removeItem).not.toHaveBeenCalled();
			expect(assignMock).not.toHaveBeenCalled();
		});
	});
});
