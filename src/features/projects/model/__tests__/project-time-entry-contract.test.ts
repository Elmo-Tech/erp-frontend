import { describe, expect, it } from "vitest";
import { mapNullableProjectTimeEntryResource, mapProjectTimeEntryList, mapProjectTimeEntryResource, type RawProjectTimeEntryResource } from "../project-time-entry-contract";

function makeRawTimeEntry(overrides: Partial<RawProjectTimeEntryResource> = {}): RawProjectTimeEntryResource {
	return {
		entryId: 44,
		taskId: 10,
		projectId: 2,
		userId: 7,
		startTime: "2026-06-01T10:00:00.000Z",
		endTime: "2026-06-01T11:30:00.000Z",
		durationMinutes: 90,
		isManual: true,
		isRunning: false,
		note: "Fix review notes",
		user: { userId: 7, name: "Mona Hassan", avatar: null },
		task: { taskId: 10, projectId: 2, title: "Build dashboard", status: "in_progress" },
		project: { projectId: 2, title: "Operations Build" },
		createdAt: "2026-06-01T10:00:00.000Z",
		updatedAt: "2026-06-01T11:30:00.000Z",
		...overrides,
	};
}

describe("project time entry contract", () => {
	it("maps backend time entry resources to the frontend contract", () => {
		expect(mapProjectTimeEntryResource(makeRawTimeEntry())).toEqual({
			entryId: 44,
			taskId: 10,
			projectId: 2,
			userId: 7,
			startTime: "2026-06-01T10:00:00.000Z",
			endTime: "2026-06-01T11:30:00.000Z",
			durationMinutes: 90,
			isManual: true,
			isRunning: false,
			note: "Fix review notes",
			user: { userId: 7, name: "Mona Hassan", avatar: null },
			task: { taskId: 10, projectId: 2, title: "Build dashboard", status: "in_progress" },
			project: { projectId: 2, title: "Operations Build" },
			createdAt: "2026-06-01T10:00:00.000Z",
			updatedAt: "2026-06-01T11:30:00.000Z",
		});
	});

	it("maps nullable active time entry responses", () => {
		expect(mapNullableProjectTimeEntryResource(null)).toBeNull();
		expect(mapNullableProjectTimeEntryResource(makeRawTimeEntry({ entryId: 45, isRunning: true, endTime: null, durationMinutes: null }))).toEqual(
			expect.objectContaining({
				entryId: 45,
				isRunning: true,
				endTime: null,
				durationMinutes: null,
			}),
		);
	});

	it("maps time entry arrays through the same resource contract", () => {
		expect(mapProjectTimeEntryList([makeRawTimeEntry({ entryId: 46, note: null })])).toEqual([
			expect.objectContaining({
				entryId: 46,
				note: null,
			}),
		]);
	});
});
