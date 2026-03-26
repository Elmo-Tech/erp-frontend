import { beforeEach, describe, expect, it, vi } from "vitest";
import * as fc from "fast-check";
import { api } from "../axios";

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

describe("Axios Property Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("adds Authorization only for non-empty tokens", async () => {
		await fc.assert(
			fc.asyncProperty(fc.oneof(fc.constant(null), fc.string()), async (token) => {
				localStorageMock.getItem.mockImplementation((key: string) => {
					if (key === "auth_token") return token;
					return null;
				});

				const requestInterceptor = api.interceptors.request.handlers[0];
				const config = await requestInterceptor.fulfilled({
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				});

				if (token && token.trim()) {
					expect(config.headers.Authorization).toBe(`Bearer ${token}`);
				} else {
					expect(config.headers).not.toHaveProperty("Authorization");
				}
			}),
			{ numRuns: 50 }
		);
	});

	it("redirects only for 401 responses", async () => {
		await fc.assert(
			fc.asyncProperty(fc.integer({ min: 400, max: 599 }), async (status) => {
				const responseInterceptor = api.interceptors.response.handlers[0];
				const error = { response: { status } };

				await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);

				if (status === 401) {
					expect(assignMock).toHaveBeenCalledWith("/login");
					expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_token");
				} else {
					expect(assignMock).not.toHaveBeenCalled();
				}

				vi.clearAllMocks();
			}),
			{ numRuns: 25 }
		);
	});
});
