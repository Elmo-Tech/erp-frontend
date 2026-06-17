import { describe, expect, it } from "vitest";
import { mapTaskDeliverableList, mapTaskDeliverableResource, type RawTaskDeliverableResource } from "../project-deliverable-contract";

function makeRawDeliverable(overrides: Partial<RawTaskDeliverableResource> = {}): RawTaskDeliverableResource {
	return {
		deliverableId: 30,
		taskId: 10,
		title: "QA checklist",
		isCompleted: false,
		createdAt: "2026-06-01T10:00:00.000Z",
		updatedAt: "2026-06-02T10:00:00.000Z",
		...overrides,
	};
}

describe("project deliverable contract", () => {
	it("maps backend deliverable resources to the frontend contract", () => {
		expect(mapTaskDeliverableResource(makeRawDeliverable())).toEqual({
			deliverableId: 30,
			taskId: 10,
			title: "QA checklist",
			isCompleted: false,
			createdAt: "2026-06-01T10:00:00.000Z",
			updatedAt: "2026-06-02T10:00:00.000Z",
		});
	});

	it("maps deliverable arrays through the same resource contract", () => {
		expect(mapTaskDeliverableList([makeRawDeliverable({ deliverableId: 31, isCompleted: true })])).toEqual([
			expect.objectContaining({
				deliverableId: 31,
				isCompleted: true,
			}),
		]);
	});
});
