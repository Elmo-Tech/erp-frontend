import { describe, expect, it } from "vitest";
import { ExecutionTaskStatus, type ProjectTask } from "@/features/projects/api/execution.api";
import { TaskPriority } from "@/shared/lib/statusHelpers";
import { groupProjectTasksByMilestone, resolveProjectTaskForSheet, toggleCollapsedSection } from "../project-tasks-board";

function makeTask(overrides: Partial<ProjectTask> = {}): ProjectTask {
	return {
		taskId: 10,
		projectId: 2,
		milestoneId: null,
		title: "Build Login",
		description: null,
		status: ExecutionTaskStatus.TO_DO,
		statusLabel: "To Do",
		priority: TaskPriority.MEDIUM,
		estimatedHours: 2,
		startDate: null,
		dueDate: null,
		assigneeId: null,
		isInBacklog: false,
		totalLoggedMinutes: 0,
		assignee: null,
		milestone: null,
		deliverables: [],
		timeEntries: [],
		createdAt: "2026-06-01T10:00:00.000Z",
		updatedAt: "2026-06-02T10:00:00.000Z",
		...overrides,
	};
}

describe("project tasks board model", () => {
	it("groups tasks by milestone and keeps null milestone tasks in backlog", () => {
		const milestoneTask = makeTask({ taskId: 1, milestoneId: 100, title: "Milestone task" });
		const secondMilestoneTask = makeTask({ taskId: 2, milestoneId: 100, title: "Second milestone task" });
		const backlogTask = makeTask({ taskId: 3, milestoneId: null, title: "Backlog task" });

		const result = groupProjectTasksByMilestone([milestoneTask, backlogTask, secondMilestoneTask]);

		expect(result.tasksByMilestone.get(100)).toEqual([milestoneTask, secondMilestoneTask]);
		expect(result.backlogTasks).toEqual([backlogTask]);
		expect(result.tasksByMilestone.has(0)).toBe(false);
	});

	it("resolves a clicked task to the fresh server task when the task list refreshes", () => {
		const staleSelectedTask = makeTask({ taskId: 10, title: "Old title" });
		const freshTask = makeTask({ taskId: 10, title: "Fresh title" });

		expect(
			resolveProjectTaskForSheet({
				tasks: [freshTask],
				selectedTask: staleSelectedTask,
				initialTaskId: null,
				dismissedInitialTask: false,
			}),
		).toBe(freshTask);
	});

	it("uses an initial task id until it is dismissed", () => {
		const initialTask = makeTask({ taskId: 44, title: "Deep-linked task" });

		expect(
			resolveProjectTaskForSheet({
				tasks: [initialTask],
				selectedTask: null,
				initialTaskId: 44,
				dismissedInitialTask: false,
			}),
		).toBe(initialTask);

		expect(
			resolveProjectTaskForSheet({
				tasks: [initialTask],
				selectedTask: null,
				initialTaskId: 44,
				dismissedInitialTask: true,
			}),
		).toBeNull();
	});

	it("toggles collapsed sections immutably", () => {
		const current = { backlog: true };
		const toggled = toggleCollapsedSection(current, "backlog");

		expect(toggled).toEqual({ backlog: false });
		expect(current).toEqual({ backlog: true });
		expect(toggleCollapsedSection(toggled, "milestone-1")).toEqual({ backlog: false, "milestone-1": true });
	});
});
