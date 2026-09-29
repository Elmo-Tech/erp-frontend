import { describe, expect, it } from "vitest";
import { Task, TaskPriority, TaskStatus, TaskType } from "../../types/task";
import { dedupeTaskTree } from "../taskTree";

const task = (taskId: number, children: Task[] = []): Task =>
	({
		taskId,
		projectId: 1,
		parentId: null,
		assignedTo: null,
		supervisorId: null,
		title: `Task ${taskId}`,
		description: "",
		acceptanceCriteria: "",
		status: TaskStatus.TODO,
		type: TaskType.MAIN,
		priority: TaskPriority.MEDIUM,
		dueDate: null,
		expectedResolutionDate: null,
		startDate: null,
		sprintNumber: null,
		estimatedHours: 0,
		reopenCount: 0,
		testCompletionPercentage: 0,
		canStartTimer: false,
		hasChildren: children.length > 0,
		completedAt: null,
		delayDays: null,
		deliveryStatus: {
			isCompleted: false,
			completedAt: null,
			dueDate: null,
			delayDays: null,
			isOverdue: false,
			isEarly: false,
			isOnTime: false,
			statusText: "Pending",
			statusColor: "default",
		},
		isOverdue: false,
		daysUntilDue: null,
		supervisor: null,
		children,
		assignees: [],
		totalTimeSpent: 0,
		createdAt: "2026-07-05T00:00:00.000Z",
		updatedAt: "2026-07-05T00:00:00.000Z",
		createdBy: 1,
		updatedBy: 1,
	});

describe("dedupeTaskTree", () => {
	it("keeps nested tasks under their parent and removes duplicate top-level rows", () => {
		const child = task(2);
		const parent = task(1, [child]);

		const dedupedTasks = dedupeTaskTree([parent, child]);

		expect(dedupedTasks.map((dedupedTask) => dedupedTask.taskId)).toEqual([1]);
		expect(dedupedTasks[0]?.children?.map((dedupedTask) => dedupedTask.taskId)).toEqual([2]);
	});
});
