import { describe, expect, it } from "vitest";
import { mapChangeRequestListData, mapChangeRequestResource, type RawChangeRequestResource } from "../project-change-request-contract";

function makeRawChangeRequest(overrides: Partial<RawChangeRequestResource> = {}): RawChangeRequestResource {
	return {
		changeRequestId: 15,
		projectId: 2,
		title: "Extra onboarding workshop",
		description: "Add a second workshop for client admins.",
		price: 750,
		status: "sent_to_client",
		statusLabel: "Sent to Client",
		createdAt: "2026-06-03T10:00:00.000Z",
		updatedAt: "2026-06-04T10:00:00.000Z",
		internalCost: 300,
		approvedBy: 7,
		...overrides,
	};
}

describe("project change request contract", () => {
	it("maps backend change request resources to the frontend contract", () => {
		const changeRequest = mapChangeRequestResource(makeRawChangeRequest());

		expect(changeRequest).toEqual({
			changeRequestId: 15,
			projectId: 2,
			title: "Extra onboarding workshop",
			description: "Add a second workshop for client admins.",
			price: 750,
			status: "sent_to_client",
			statusLabel: "Sent to Client",
			createdAt: "2026-06-03T10:00:00.000Z",
			updatedAt: "2026-06-04T10:00:00.000Z",
		});
		expect("internalCost" in changeRequest).toBe(false);
		expect("approvedBy" in changeRequest).toBe(false);
	});

	it("maps change request lists through the same resource contract", () => {
		expect(mapChangeRequestListData({ changeRequests: [makeRawChangeRequest({ changeRequestId: 16, status: "approved" })] })).toEqual([
			expect.objectContaining({
				changeRequestId: 16,
				status: "approved",
			}),
		]);
	});
});
