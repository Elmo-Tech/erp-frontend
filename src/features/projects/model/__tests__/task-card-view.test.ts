import { describe, expect, it } from "vitest";
import { ExecutionTaskStatus, type ProjectTask } from "../../api/execution.api";
import { buildTaskCardView, formatTaskLoggedTime, getTaskAssigneeInitials } from "../task-card-view";

function makeTask(overrides: Partial<ProjectTask> = {}): ProjectTask {
	return {
		taskId: 10,
		projectId: 2,
		milestoneId: null,
		title: "Build Login",
		description: null,
		status: ExecutionTaskStatus.TO_DO,
		statusLabel: "To Do",
		estimatedHours: 2,
		startDate: null,
		dueDate: null,
		assigneeId: null,
		isInBacklog: false,
		totalLoggedMinutes: 125,
		assignee: null,
		milestone: null,
		deliverables: [
			{ deliverableId: 1, taskId: 10, title: "One", isCompleted: true, createdAt: "", updatedAt: "" },
			{ deliverableId: 2, taskId: 10, title: "Two", isCompleted: false, createdAt: "", updatedAt: "" },
		],
		timeEntries: [],
		createdAt: "2026-06-01T10:00:00.000Z",
		updatedAt: "2026-06-02T10:00:00.000Z",
		...overrides,
	};
}

describe("task-card-view", () => {
	it("builds the display model from backend-backed task fields", () => {
		const view = buildTaskCardView(
			makeTask({
				status: ExecutionTaskStatus.IN_PROGRESS,
				timeEntries: [
					{
						entryId: 3,
						taskId: 10,
						userId: 4,
						startTime: "2026-06-01T10:00:00.000Z",
						endTime: null,
						durationMinutes: null,
						isManual: false,
						isRunning: true,
						note: null,
						createdAt: "",
						updatedAt: "",
					},
				],
			}),
		);

		expect(view.statusLabel).toBe("In Progress");
		expect(view.cardStatusClass).toContain("border-blue-500");
		expect(view.completedDeliverables).toBe(1);
		expect(view.totalDeliverables).toBe(2);
		expect(view.isRunning).toBe(true);
		expect(view.isCompleted).toBe(false);
	});

	it("formats logged time and assignee initials consistently", () => {
		expect(formatTaskLoggedTime(0)).toBe("0m");
		expect(formatTaskLoggedTime(125)).toBe("2h 5m");
		expect(getTaskAssigneeInitials("Hisham Atef")).toBe("HA");
	});
});
