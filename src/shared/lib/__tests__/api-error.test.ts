import { describe, expect, it } from "vitest";
import { AxiosError } from "axios";
import { getApiErrorMessage } from "../api-error";

describe("getApiErrorMessage", () => {
	it("returns backend validation error messages from the errors payload", () => {
		const error = new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
			status: 422,
			statusText: "Unprocessable Content",
			headers: {},
			config: {} as never,
			data: {
				success: false,
				message: "validation.failed",
				errors: {
					scheduledAt: ["The scheduled at field must be a date after now."],
				},
			},
		});

		expect(getApiErrorMessage(error, "Failed to schedule meeting")).toBe("The scheduled at field must be a date after now.");
	});
});
