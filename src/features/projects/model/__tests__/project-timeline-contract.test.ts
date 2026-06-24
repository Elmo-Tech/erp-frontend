import { describe, expect, it } from "vitest";
import { buildProjectTimelineQuery, mapProjectTimelineResponse, type RawProjectTimelineResponse } from "../project-timeline-contract";

function makeRawTimeline(overrides: Partial<RawProjectTimelineResponse> = {}): RawProjectTimelineResponse {
	return {
		range: {
			startDate: "2026-06-07",
			endDate: "2026-06-11",
		},
		users: [
			{
				userId: 7,
				name: "Mona Hassan",
				avatar: null,
				dailyCapacityHoursByDate: {
					"2026-06-07": 8,
					"2026-06-08": 8,
				},
			},
		],
		items: [
			{
				taskId: 10,
				projectId: 2,
				projectTitle: "Operations Build",
				title: "Build dashboard",
				assigneeId: 7,
				startDate: "2026-06-07",
				dueDate: "2026-06-09",
				estimatedHours: 12,
				status: "in_progress",
				allocatedHoursByDate: {
					"2026-06-07": 6,
					"2026-06-08": 6,
				},
			},
		],
		conflicts: [
			{
				userId: 7,
				date: "2026-06-08",
				capacityHours: 8,
				allocatedHours: 10,
				overloadHours: 2,
				taskIds: [10, 11],
			},
		],
		suggestions: [
			{
				type: "reassign",
				risk: "medium",
				taskId: 10,
				reason: "Assignee is overloaded on 2026-06-08.",
				current: {
					startDate: "2026-06-07",
					dueDate: "2026-06-09",
					assigneeId: 7,
				},
				suggested: {
					startDate: "2026-06-07",
					dueDate: "2026-06-09",
					assigneeId: 8,
					assigneeName: "Omar Adel",
				},
			},
		],
		...overrides,
	};
}

describe("project timeline contract", () => {
	it("builds the backend-supported timeline query without unsupported frontend filters", () => {
		expect(
			buildProjectTimelineQuery({
				startDate: "2026-06-07",
				endDate: "2026-06-11",
				projectIds: [2, 4],
				userIds: [7],
				status: "in_progress",
				overloadOnly: true,
			}),
		).toBe("startDate=2026-06-07&endDate=2026-06-11&projectIds%5B%5D=2&projectIds%5B%5D=4&userIds%5B%5D=7");
	});

	it("maps the raw timeline response without inventing extra fields", () => {
		const timeline = mapProjectTimelineResponse(makeRawTimeline());

		expect(timeline).toEqual(makeRawTimeline());
		expect("statusLabel" in timeline.items[0]).toBe(false);
		expect("project" in timeline.items[0]).toBe(false);
	});
});
