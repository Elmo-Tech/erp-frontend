import { describe, expect, it } from "vitest";
import { TaskPriority } from "@/shared/lib/statusHelpers";
import { buildProjectTaskQuery, mapProjectTaskListData, mapProjectTaskResource, type RawProjectTaskResource } from "../project-task-contract";

function makeRawTask(overrides: Partial<RawProjectTaskResource> = {}): RawProjectTaskResource {
	return {
		taskId: 10,
		projectId: 2,
		milestoneId: null,
		parentId: 99,
		title: "Build dashboard",
		description: null,
		status: "to_do",
		statusLabel: "To Do",
		priority: undefined,
		estimatedHours: 4,
		startDate: "2026-06-10",
		dueDate: "2026-06-12",
		assigneeId: 7,
		isInBacklog: true,
		totalLoggedMinutes: 90,
		assignee: { userId: 7, name: "Mona", avatar: null },
		milestone: null,
		subtasks: [{ taskId: 99 }],
		deliverables: [],
		timeEntries: [],
		createdAt: "2026-06-01T10:00:00.000Z",
		updatedAt: "2026-06-02T10:00:00.000Z",
		...overrides,
	};
}

describe("project task contract", () => {
	it("maps backend task resources to the flat frontend task contract", () => {
		const task = mapProjectTaskResource(makeRawTask());

		expect(task).toEqual({
			taskId: 10,
			projectId: 2,
			milestoneId: null,
			title: "Build dashboard",
			description: null,
			status: "to_do",
			statusLabel: "To Do",
			priority: TaskPriority.MEDIUM,
			estimatedHours: 4,
			startDate: "2026-06-10",
			dueDate: "2026-06-12",
			assigneeId: 7,
			isInBacklog: true,
			totalLoggedMinutes: 90,
			assignee: { userId: 7, name: "Mona", avatar: null },
			milestone: null,
			project: undefined,
			deliverables: [],
			timeEntries: [],
			createdAt: "2026-06-01T10:00:00.000Z",
			updatedAt: "2026-06-02T10:00:00.000Z",
		});
		expect("parentId" in task).toBe(false);
		expect("subtasks" in task).toBe(false);
	});

	it("maps task lists through the same resource contract", () => {
		expect(mapProjectTaskListData({ tasks: [makeRawTask({ taskId: 11, title: "QA flow", priority: TaskPriority.URGENT })] })).toEqual([
			expect.objectContaining({
				taskId: 11,
				title: "QA flow",
				priority: TaskPriority.URGENT,
			}),
		]);
	});

	it("builds the project task filter query without adding empty filters", () => {
		expect(
			buildProjectTaskQuery({
				status: "to_do",
				priority: TaskPriority.URGENT,
				milestoneId: 3,
				assigneeId: 7,
				isInBacklog: true,
				dueFrom: "2026-06-01",
				dueTo: "2026-06-30",
				search: "dashboard",
			}),
		).toBe(
			"filter%5Bstatus%5D=to_do&filter%5Bpriority%5D=urgent&filter%5BmilestoneId%5D=3&filter%5BassigneeId%5D=7&filter%5BisInBacklog%5D=true&filter%5BdueFrom%5D=2026-06-01&filter%5BdueTo%5D=2026-06-30&filter%5Bsearch%5D=dashboard",
		);

		expect(buildProjectTaskQuery({ search: "", isInBacklog: false })).toBe("filter%5BisInBacklog%5D=false");
		expect(buildProjectTaskQuery()).toBe("");
	});
});
