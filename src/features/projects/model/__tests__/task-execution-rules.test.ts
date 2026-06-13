import { describe, expect, it } from "vitest";
import { ExecutionTaskStatus } from "../../api/execution.api";
import { getAllowedTaskStatusOptions, getPrimaryTaskAction } from "../task-execution-rules";

const managerAccess = {
	canManageAllProjects: false,
	canManageTasks: false,
	canEditTasks: true,
	canWorkOnTasks: false,
	canManageDeliverables: false,
	projectRole: "manager",
	currentUserId: 7,
} as const;

const developerAccess = {
	canManageAllProjects: false,
	canManageTasks: false,
	canEditTasks: false,
	canWorkOnTasks: true,
	canManageDeliverables: false,
	projectRole: "developer",
	currentUserId: 7,
} as const;

describe("task execution rules", () => {
	it("filters status options by task permissions", () => {
		expect(
			getAllowedTaskStatusOptions({
				...developerAccess,
				canWorkOnTasks: false,
			}),
		).toEqual([]);

		expect(getAllowedTaskStatusOptions(developerAccess).map((option) => option.value)).toEqual([
			ExecutionTaskStatus.BACKLOG,
			ExecutionTaskStatus.TO_DO,
			ExecutionTaskStatus.IN_PROGRESS,
			ExecutionTaskStatus.IN_REVIEW,
			ExecutionTaskStatus.QA,
		]);

		expect(getAllowedTaskStatusOptions(managerAccess).map((option) => option.value)).toContain(ExecutionTaskStatus.DONE);
	});

	it("derives the footer action from permissions and assignment", () => {
		expect(
			getPrimaryTaskAction({
				...managerAccess,
				taskStatus: ExecutionTaskStatus.TO_DO,
				taskAssigneeId: 8,
			}),
		).toEqual({
			label: "Mark as Done",
			targetStatus: ExecutionTaskStatus.DONE,
			useCompleteEndpoint: true,
			requiresAllDeliverables: true,
		});

		expect(
			getPrimaryTaskAction({
				...developerAccess,
				taskStatus: ExecutionTaskStatus.TO_DO,
				taskAssigneeId: 7,
			}),
		).toEqual({
			label: "Submit for Review",
			targetStatus: ExecutionTaskStatus.IN_REVIEW,
			useCompleteEndpoint: false,
			requiresAllDeliverables: false,
		});

		expect(
			getPrimaryTaskAction({
				...developerAccess,
				taskStatus: ExecutionTaskStatus.TO_DO,
				taskAssigneeId: 8,
			}),
		).toBeNull();

		expect(
			getPrimaryTaskAction({
				...developerAccess,
				taskStatus: ExecutionTaskStatus.IN_REVIEW,
				taskAssigneeId: 7,
			}),
		).toBeNull();
	});
});
