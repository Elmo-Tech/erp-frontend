import type { InternalAxiosRequestConfig } from "axios";
import { describe, expect, it, vi } from "vitest";
import { handleApiRequest } from "../base";

describe("API auth interceptor", () => {
	it("allows login requests when persisted auth is expired", async () => {
		vi.mocked(window.localStorage.getItem).mockReturnValueOnce(
			JSON.stringify({
				state: {
					tokenExpiresAt: new Date(Date.now() - 60_000).toISOString(),
				},
			}),
		);

		const config = { url: "/auth/login", headers: {} } as InternalAxiosRequestConfig;

		await expect(handleApiRequest(config)).resolves.toBe(config);
	});
});
