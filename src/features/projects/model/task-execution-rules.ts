import { EXECUTION_TASK_STATUS_OPTIONS, ExecutionTaskStatus, type ExecutionTaskStatusValue, type TaskAllowedActions } from "../api/execution.api";

export interface TaskExecutionAccess {
	canManageAllProjects: boolean;
	canManageTasks: boolean;
	canWorkOnTasks: boolean;
	canChangeTaskStatus: boolean;
	canCompleteTasks: boolean;
	canReopenTasks: boolean;
	currentUserId?: number | null;
	allowedActions?: TaskAllowedActions;
}

export interface TaskExecutionAction {
	label: "Mark as Done" | "Submit for Review";
	targetStatus: ExecutionTaskStatusValue;
	useCompleteEndpoint: boolean;
	requiresAllDeliverables: boolean;
}

type TaskStatusOption = (typeof EXECUTION_TASK_STATUS_OPTIONS)[number];

interface TaskExecutionActionInput extends TaskExecutionAccess {
	taskStatus: string;
	taskAssigneeId: number | null;
}

const ASSIGNEE_WORKFLOW_STATUSES: readonly string[] = [ExecutionTaskStatus.TO_DO, ExecutionTaskStatus.IN_PROGRESS, ExecutionTaskStatus.IN_REVIEW];
const SUBMITTED_REVIEW_STATUSES: readonly string[] = [ExecutionTaskStatus.IN_REVIEW, ExecutionTaskStatus.QA, ExecutionTaskStatus.DONE];

function hasUmbrellaAccess(access: TaskExecutionAccess): boolean {
	return access.canManageAllProjects || access.canManageTasks;
}

function canCompleteTask(access: TaskExecutionAccess): boolean {
	return access.allowedActions?.complete ?? (hasUmbrellaAccess(access) || access.canCompleteTasks);
}

function canReopenTask(access: TaskExecutionAccess): boolean {
	return access.allowedActions?.reopen ?? (hasUmbrellaAccess(access) || access.canReopenTasks);
}

function canChangeAdministrativeStatus(access: TaskExecutionAccess): boolean {
	return access.allowedActions?.changeStatus ?? (hasUmbrellaAccess(access) || access.canChangeTaskStatus);
}

function canAssigneeUseWorkflow(input: TaskExecutionActionInput): boolean {
	if (input.allowedActions && !input.allowedActions.changeStatus) return false;

	return input.canWorkOnTasks && input.taskAssigneeId === input.currentUserId;
}

function canChangeToStatus(input: TaskExecutionActionInput, targetStatus: string): boolean {
	if (targetStatus === ExecutionTaskStatus.DONE) return canCompleteTask(input);
	if (input.taskStatus === ExecutionTaskStatus.DONE) return canReopenTask(input);
	if (canChangeAdministrativeStatus(input)) return true;

	return canAssigneeUseWorkflow(input) && ASSIGNEE_WORKFLOW_STATUSES.includes(targetStatus);
}

export function getAllowedTaskStatusOptions(input: TaskExecutionActionInput): TaskStatusOption[] {
	const actionableOptions = EXECUTION_TASK_STATUS_OPTIONS.filter(
		(option) => option.value !== input.taskStatus && canChangeToStatus(input, option.value),
	);
	if (actionableOptions.length === 0) return [];

	return EXECUTION_TASK_STATUS_OPTIONS.filter((option) => option.value === input.taskStatus || actionableOptions.includes(option));
}

function getCompletionAction(): TaskExecutionAction {
	return {
		label: "Mark as Done",
		targetStatus: ExecutionTaskStatus.DONE,
		useCompleteEndpoint: true,
		requiresAllDeliverables: true,
	};
}

function getSubmitForReviewAction(): TaskExecutionAction {
	return {
		label: "Submit for Review",
		targetStatus: ExecutionTaskStatus.IN_REVIEW,
		useCompleteEndpoint: false,
		requiresAllDeliverables: false,
	};
}

export function getPrimaryTaskAction(input: TaskExecutionActionInput): TaskExecutionAction | null {
	if (input.taskStatus === ExecutionTaskStatus.DONE) return null;
	if (canCompleteTask(input)) return getCompletionAction();
	if (!canAssigneeUseWorkflow(input)) return null;
	if (SUBMITTED_REVIEW_STATUSES.includes(input.taskStatus)) return null;

	return getSubmitForReviewAction();
}
