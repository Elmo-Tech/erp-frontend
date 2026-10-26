import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import api, { handleApiRequest, handleApiResponse, handleApiResponseError } from "../axios";
import { notifyApiError } from "../errorHandling";

const mocks = vi.hoisted(() => ({
	toastSuccess: vi.fn(),
	toastError: vi.fn(),
}));

vi.mock("sonner", () => ({
	toast: {
		success: mocks.toastSuccess,
		error: mocks.toastError,
	},
}));

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
		it("preserves uploaded files through Axios transforms instead of serializing FormData as JSON", async () => {
			const file = new File(["signed contract"], "contract.pdf", { type: "application/pdf" });
			const body = new FormData();
			body.append("file", file);
			await api.post("/employment-contracts/7/file", body, { adapter: async (config) => {
				expect(config.data).toBeInstanceOf(FormData);
				expect((config.data as FormData).get("file")).toBe(file);
				expect(config.headers.get("Content-Type")).not.toBe("application/json");
				return { data: {}, status: 201, statusText: "Created", headers: {}, config };
			} });
		});
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
		it("shows backend success messages for write responses", () => {
			const response = {
				config: { method: "post" },
				data: { success: true, message: "User created from backend" },
			};

			expect(handleApiResponse(response as never)).toBe(response);
			expect(mocks.toastSuccess).toHaveBeenCalledWith("User created from backend");
		});

		it("does not show success toasts for read responses", () => {
			handleApiResponse({
				config: { method: "get" },
				data: { success: true, message: "List loaded" },
			} as never);

			expect(mocks.toastSuccess).not.toHaveBeenCalled();
		});

		it("keeps background heartbeats and caller-owned rich feedback silent", () => {
			handleApiResponse({ config: { method: "post", skipSuccessToast: true }, data: { message: "Heartbeat updated" } } as never);
			expect(mocks.toastSuccess).not.toHaveBeenCalled();
		});

		it("clears auth state and redirects on 401 responses", async () => {
			const error = {
				response: {
					status: 401,
					data: { message: "Unauthenticated from backend" },
				},
			};

			await expect(handleApiResponseError(error as never)).rejects.toEqual(error);

			expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_token");
			expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth-storage");
			expect(assignMock).toHaveBeenCalledWith("/login");
			expect(mocks.toastError).toHaveBeenCalledWith("Unauthenticated from backend", { id: "api-error:Unauthenticated from backend" });
		});

		it("does not clear auth state for non-401 responses", async () => {
			const error = {
				response: {
					status: 400,
					data: { message: "Backend rejected it" },
				},
			};

			await expect(handleApiResponseError(error as never)).rejects.toEqual(error);

			expect(localStorageMock.removeItem).not.toHaveBeenCalled();
			expect(assignMock).not.toHaveBeenCalled();
			expect(mocks.toastError).toHaveBeenCalledWith("Backend rejected it", { id: "api-error:Backend rejected it" });
		});

		it("does not reload the login page after wrong credentials", async () => {
			const error = { config: { url: "/auth/login" }, response: { status: 401, data: { message: "Wrong credentials" } } };
			await expect(handleApiResponseError(error as never)).rejects.toBe(error);
			expect(assignMock).not.toHaveBeenCalled();
			expect(localStorageMock.removeItem).not.toHaveBeenCalled();
		});

		it("shows one toast when the interceptor and the form handle the same failed request", async () => {
			const error = { response: { status: 422, data: { errors: { reason: ["A reason is required"] } } } };
			await handleApiResponseError(error as never).catch(notifyApiError);
			expect(mocks.toastError).toHaveBeenCalledTimes(1);
		});
	});
});
