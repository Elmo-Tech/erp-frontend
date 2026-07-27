import { describe, expect, it } from "vitest";
import { ExecutionTaskStatus, type TaskAllowedActions } from "../../api/execution.api";
import { getAllowedTaskStatusOptions, getPrimaryTaskAction } from "../task-execution-rules";

const noAccess = {
	canManageAllProjects: false,
	canManageTasks: false,
	canWorkOnTasks: false,
	canChangeTaskStatus: false,
	canCompleteTasks: false,
	canReopenTasks: false,
	currentUserId: 7,
} as const;

const deniedActions: TaskAllowedActions = {
	edit: false,
	delete: false,
	execute: false,
	startTimer: false,
	stopTimer: false,
	changeStatus: false,
	complete: false,
	reopen: false,
	createDeliverable: false,
	editDeliverable: false,
	deleteDeliverable: false,
	toggleDeliverable: false,
};

describe("task execution rules", () => {
	it("maps normal, completion, and reopen transitions to separate permissions", () => {
		const ordinaryStatuses = getAllowedTaskStatusOptions({
			...noAccess,
			canChangeTaskStatus: true,
			taskStatus: ExecutionTaskStatus.TO_DO,
			taskAssigneeId: 8,
		}).map((option) => option.value);
		expect(ordinaryStatuses).toContain(ExecutionTaskStatus.IN_PROGRESS);
		expect(ordinaryStatuses).not.toContain(ExecutionTaskStatus.DONE);

		const completionStatuses = getAllowedTaskStatusOptions({
			...noAccess,
			canCompleteTasks: true,
			taskStatus: ExecutionTaskStatus.TO_DO,
			taskAssigneeId: 8,
		}).map((option) => option.value);
		expect(completionStatuses).toEqual([ExecutionTaskStatus.TO_DO, ExecutionTaskStatus.DONE]);

		const reopenedStatuses = getAllowedTaskStatusOptions({
			...noAccess,
			canReopenTasks: true,
			taskStatus: ExecutionTaskStatus.DONE,
			taskAssigneeId: 8,
		}).map((option) => option.value);
		expect(reopenedStatuses).toContain(ExecutionTaskStatus.IN_PROGRESS);
		expect(reopenedStatuses).toContain(ExecutionTaskStatus.DONE);
	});

	it("limits an assigned worker to execution workflow through review", () => {
		const statuses = getAllowedTaskStatusOptions({
			...noAccess,
			canWorkOnTasks: true,
			taskStatus: ExecutionTaskStatus.TO_DO,
			taskAssigneeId: 7,
		}).map((option) => option.value);

		expect(statuses).toEqual([ExecutionTaskStatus.TO_DO, ExecutionTaskStatus.IN_PROGRESS, ExecutionTaskStatus.IN_REVIEW]);
		expect(
			getPrimaryTaskAction({
				...noAccess,
				canWorkOnTasks: true,
				taskStatus: ExecutionTaskStatus.TO_DO,
				taskAssigneeId: 7,
			}),
		).toMatchObject({ label: "Submit for Review", targetStatus: ExecutionTaskStatus.IN_REVIEW });
	});

	it("uses complete permission for the done action instead of edit permission", () => {
		expect(
			getPrimaryTaskAction({
				...noAccess,
				canCompleteTasks: true,
				taskStatus: ExecutionTaskStatus.TO_DO,
				taskAssigneeId: 8,
			}),
		).toMatchObject({ label: "Mark as Done", targetStatus: ExecutionTaskStatus.DONE });

		expect(
			getPrimaryTaskAction({
				...noAccess,
				canChangeTaskStatus: true,
				taskStatus: ExecutionTaskStatus.TO_DO,
				taskAssigneeId: 8,
			}),
		).toBeNull();
	});

	it("treats resource allowedActions as authoritative when present", () => {
		const input = {
			...noAccess,
			canManageAllProjects: true,
			allowedActions: deniedActions,
			taskStatus: ExecutionTaskStatus.TO_DO,
			taskAssigneeId: 7,
		};

		expect(getAllowedTaskStatusOptions(input)).toEqual([]);
		expect(getPrimaryTaskAction(input)).toBeNull();
	});
});
