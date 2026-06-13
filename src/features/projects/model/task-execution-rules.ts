import { EXECUTION_TASK_STATUS_OPTIONS, ExecutionTaskStatus, type ExecutionTaskStatusValue } from "../api/execution.api";

interface TaskExecutionAccess {
	canManageAllProjects: boolean;
	canManageTasks: boolean;
	canEditTasks: boolean;
	canWorkOnTasks: boolean;
	canManageDeliverables: boolean;
	projectRole: string | null;
	currentUserId?: number | null;
}

interface TaskExecutionAction {
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

const SUBMITTED_REVIEW_STATUSES: readonly string[] = [ExecutionTaskStatus.IN_REVIEW, ExecutionTaskStatus.QA, ExecutionTaskStatus.DONE];

function canMarkTaskAsCompleted(access: TaskExecutionAccess): boolean {
	return access.canManageAllProjects || access.canManageDeliverables || access.canManageTasks || access.projectRole === "manager" || access.projectRole === "tech_lead";
}

function canUpdateTaskStatus(access: TaskExecutionAccess): boolean {
	return access.canManageAllProjects || access.canManageTasks || access.canEditTasks || access.canWorkOnTasks;
}

export function getAllowedTaskStatusOptions(access: TaskExecutionAccess): TaskStatusOption[] {
	if (!canUpdateTaskStatus(access)) {
		return [];
	}

	if (canMarkTaskAsCompleted(access)) {
		return [...EXECUTION_TASK_STATUS_OPTIONS];
	}

	return EXECUTION_TASK_STATUS_OPTIONS.filter((option) => option.value !== ExecutionTaskStatus.DONE);
}

function getManagerCompletionAction(): TaskExecutionAction {
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
	if (input.taskStatus === ExecutionTaskStatus.DONE) {
		return null;
	}

	if (input.canEditTasks || input.canManageAllProjects || input.canManageTasks) {
		return getManagerCompletionAction();
	}

	if (!input.canWorkOnTasks || input.taskAssigneeId !== input.currentUserId) {
		return null;
	}

	if (SUBMITTED_REVIEW_STATUSES.includes(input.taskStatus)) {
		return null;
	}

	return getSubmitForReviewAction();
}
