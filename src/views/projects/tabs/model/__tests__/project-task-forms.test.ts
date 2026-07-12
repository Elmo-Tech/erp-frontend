import { afterEach, describe, expect, it, vi } from "vitest";
import { buildAddTaskFormDefaults, buildEditTaskFormDefaults, mapAddMilestoneFormToPayload, mapAddTaskFormToPayload, mapEditTaskFormToPayload } from "../project-task-forms";
import { ExecutionTaskStatus, type ProjectTask } from "@/features/projects/api/execution.api";
import { TaskPriority } from "@/shared/lib/statusHelpers";

function makeTask(overrides: Partial<ProjectTask> = {}): ProjectTask {
	return {
		taskId: 10,
		projectId: 2,
		milestoneId: null,
		title: "Build Login",
		description: null,
		status: ExecutionTaskStatus.TO_DO,
		statusLabel: "To Do",
		estimatedHours: null,
		startDate: null,
		dueDate: null,
		priority: TaskPriority.MEDIUM,
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

describe("project task forms model", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("defaults new tasks to the current user and today's local date", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 6, 12, 9, 30));

		expect(buildAddTaskFormDefaults(7)).toMatchObject({
			assigneeId: "7",
			startDate: "2026-07-12",
		});
	});

	it("maps milestone form data to the backend payload", () => {
		expect(mapAddMilestoneFormToPayload({ title: "Phase 1" })).toEqual({ title: "Phase 1" });
	});

	it("maps blank optional task fields to null or undefined exactly as the create endpoint expects", () => {
		expect(
			mapAddTaskFormToPayload({
				title: "Build Login",
				description: "   ",
				milestoneId: "",
				assigneeId: "",
				estimatedHours: undefined,
				startDate: "",
				dueDate: "",
				priority: "high",
			}),
		).toEqual({
			title: "Build Login",
			description: undefined,
			milestoneId: null,
			assigneeId: null,
			estimatedHours: null,
			startDate: null,
			dueDate: null,
			priority: "high",
		});
	});

	it("maps filled task form fields to typed backend values", () => {
		expect(
			mapAddTaskFormToPayload({
				title: "Build Login",
				description: "  Acceptance criteria  ",
				milestoneId: "12",
				assigneeId: "7",
				estimatedHours: 2.5,
				startDate: "2026-06-01",
				dueDate: "2026-06-05",
				priority: "urgent",
			}),
		).toEqual({
			title: "Build Login",
			description: "Acceptance criteria",
			milestoneId: 12,
			assigneeId: 7,
			estimatedHours: 2.5,
			startDate: "2026-06-01",
			dueDate: "2026-06-05",
			priority: "urgent",
		});
	});

	it("builds edit task form defaults from the selected backend task", () => {
		expect(
			buildEditTaskFormDefaults(
				makeTask({
					description: "Existing description",
					milestoneId: 12,
					assigneeId: 7,
					estimatedHours: 3.5,
					startDate: "2026-06-01",
					dueDate: "2026-06-05",
					priority: TaskPriority.HIGH,
				}),
			),
		).toEqual({
			title: "Build Login",
			description: "Existing description",
			milestoneId: "12",
			assigneeId: "7",
			estimatedHours: 3.5,
			startDate: "2026-06-01",
			dueDate: "2026-06-05",
			priority: "high",
		});
	});

	it("maps edit task form fields to the backend update payload", () => {
		expect(
			mapEditTaskFormToPayload({
				title: "Updated Login",
				description: "",
				milestoneId: "",
				assigneeId: "7",
				estimatedHours: undefined,
				startDate: "",
				dueDate: "2026-06-05",
				priority: "low",
			}),
		).toEqual({
			title: "Updated Login",
			description: null,
			milestoneId: null,
			assigneeId: 7,
			estimatedHours: null,
			startDate: null,
			dueDate: "2026-06-05",
			priority: "low",
		});
	});
});
