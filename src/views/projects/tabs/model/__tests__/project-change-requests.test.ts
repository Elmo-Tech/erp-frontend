import { describe, expect, it } from "vitest";
import {
	changeRequestStatusOptions,
	createChangeRequestFormDefaults,
	createChangeRequestSchema,
	mapCreateChangeRequestFormToPayload,
} from "../project-change-requests";

describe("project-change-requests model", () => {
	it("exposes only backend-supported change request statuses", () => {
		expect(changeRequestStatusOptions).toEqual([
			{ value: "draft", label: "Draft" },
			{ value: "sent_to_client", label: "Sent to Client" },
			{ value: "approved", label: "Approved" },
			{ value: "rejected", label: "Rejected" },
		]);
	});

	it("normalizes valid create form values before building the API payload", () => {
		const parsed = createChangeRequestSchema.parse({
			title: "  Extra onboarding workshop  ",
			description: "  Add a second workshop for client admins.  ",
			price: "750.5",
		});

		expect(mapCreateChangeRequestFormToPayload(parsed)).toEqual({
			title: "Extra onboarding workshop",
			description: "Add a second workshop for client admins.",
			price: 750.5,
		});
	});

	it("keeps create defaults aligned with the form contract", () => {
		expect(createChangeRequestFormDefaults).toEqual({
			title: "",
			description: "",
			price: 0,
		});
	});

	it("rejects empty required text and negative prices", () => {
		const parsed = createChangeRequestSchema.safeParse({
			title: " ",
			description: "",
			price: -1,
		});

		expect(parsed.success).toBe(false);
		if (!parsed.success) {
			expect(parsed.error.issues.map((issue) => issue.message)).toEqual(
				expect.arrayContaining(["Title is required", "Description is required", "Price must be at least 0"]),
			);
		}
	});
});
