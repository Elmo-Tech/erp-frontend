import { describe, expect, it } from "vitest";
import { mapProjectHistoryEntry, mapProjectHistoryListData, type RawProjectHistoryEntry } from "../project-history-contract";

function makeRawHistory(overrides: Partial<RawProjectHistoryEntry> = {}): RawProjectHistoryEntry {
	return {
		historyId: 55,
		projectId: 2,
		fieldName: "status",
		oldValue: "to_do",
		newValue: "in_progress",
		reason: "Started implementation",
		changedBy: 7,
		changedByUser: {
			userId: 7,
			name: "Mona Hassan",
			email: "mona@example.com",
		},
		createdAt: "2026-06-01T10:00:00.000000Z",
		updatedAt: "2026-06-01T10:00:00.000000Z",
		...overrides,
	};
}

describe("project history contract", () => {
	it("maps backend history resources to the activity entry contract", () => {
		expect(mapProjectHistoryEntry(makeRawHistory())).toEqual({
			historyId: 55,
			projectId: 2,
			fieldName: "status",
			oldValue: "to_do",
			newValue: "in_progress",
			reason: "Started implementation",
			changedBy: 7,
			changedByUser: {
				userId: 7,
				name: "Mona Hassan",
				email: "mona@example.com",
			},
			createdAt: "2026-06-01T10:00:00.000000Z",
			updatedAt: "2026-06-01T10:00:00.000000Z",
		});
	});

	it("does not fabricate an author when the backend omits the loaded relationship", () => {
		const rawWithoutAuthor = makeRawHistory();
		delete rawWithoutAuthor.changedByUser;

		const entry = mapProjectHistoryEntry(rawWithoutAuthor);

		expect("changedByUser" in entry).toBe(false);
	});

	it("maps history list envelopes through the same resource contract", () => {
		expect(mapProjectHistoryListData({ histories: [makeRawHistory({ historyId: 56, reason: "" })] })).toEqual([
			expect.objectContaining({
				historyId: 56,
				reason: "",
			}),
		]);
	});
});
