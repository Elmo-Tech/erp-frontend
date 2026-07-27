import { TaskPriority, type MilestoneStatus } from "@/shared/lib/statusHelpers";
import { mapTaskDeliverableList, type RawTaskDeliverableResource, type TaskDeliverable } from "./project-deliverable-contract";
import { mapProjectTimeEntryList, type ProjectTimeEntry, type RawProjectTimeEntryResource } from "./project-time-entry-contract";

export const ExecutionTaskStatus = {
	BACKLOG: "backlog",
	TO_DO: "to_do",
	IN_PROGRESS: "in_progress",
	ON_HOLD: "on_hold",
	IN_REVIEW: "in_review",
	QA: "qa",
	DONE: "done",
	CANCELLED: "cancelled",
} as const;

export type ExecutionTaskStatusValue = (typeof ExecutionTaskStatus)[keyof typeof ExecutionTaskStatus];

export const ExecutionTaskStatusLabels: Record<ExecutionTaskStatusValue, string> = {
	backlog: "Backlog",
	to_do: "To Do",
	in_progress: "In Progress",
	on_hold: "On Hold",
	in_review: "In Review",
	qa: "QA",
	done: "Done",
	cancelled: "Cancelled",
};

export const ExecutionTaskStatusColors: Record<ExecutionTaskStatusValue, string> = {
	backlog: "bg-muted text-muted-foreground border-border",
	to_do: "bg-muted text-muted-foreground border-border",
	in_progress: "bg-blue-100 text-blue-700 border-blue-200",
	on_hold: "bg-orange-100 text-orange-700 border-orange-200",
	in_review: "bg-yellow-100 text-yellow-700 border-yellow-200",
	qa: "bg-purple-100 text-purple-700 border-purple-200",
	done: "bg-emerald-100 text-emerald-700 border-emerald-200",
	cancelled: "bg-red-100 text-red-700 border-red-200",
};

export const EXECUTION_TASK_STATUS_OPTIONS = [
	{ value: ExecutionTaskStatus.BACKLOG, label: "Backlog" },
	{ value: ExecutionTaskStatus.TO_DO, label: "To Do" },
	{ value: ExecutionTaskStatus.IN_PROGRESS, label: "In Progress" },
	{ value: ExecutionTaskStatus.ON_HOLD, label: "On Hold" },
	{ value: ExecutionTaskStatus.IN_REVIEW, label: "In Review" },
	{ value: ExecutionTaskStatus.QA, label: "QA" },
	{ value: ExecutionTaskStatus.DONE, label: "Done" },
	{ value: ExecutionTaskStatus.CANCELLED, label: "Cancelled" },
] as const;

export interface TaskAssignee {
	userId: number;
	name: string;
	avatar?: string | null;
}

export interface TaskAllowedActions {
	edit: boolean;
	delete: boolean;
	execute: boolean;
	startTimer: boolean;
	stopTimer: boolean;
	changeStatus: boolean;
	complete: boolean;
	reopen: boolean;
	createDeliverable: boolean;
	editDeliverable: boolean;
	deleteDeliverable: boolean;
	toggleDeliverable: boolean;
}

export interface ProjectWorkflowStage {
	stageId: number;
	name: string;
	status: ExecutionTaskStatusValue;
	color: string;
	position: number;
	isTerminal: boolean;
	taskCount?: number;
}

export interface WorkflowTemplate {
	templateId: number;
	name: string;
	isDefault: boolean;
	stages: ProjectWorkflowStage[];
}

export interface ProjectWorkflow {
	stages: ProjectWorkflowStage[];
	allowedActions: {
		manage: boolean;
		manageTemplates: boolean;
	};
}

export interface ProjectTask {
	taskId: number;
	projectId: number;
	milestoneId: number | null;
	title: string;
	description: string | null;
	coverImageUrl?: string | null;
	status: string;
	statusLabel: string | null;
	priority: TaskPriority;
	estimatedHours: number | null;
	startDate?: string | null;
	dueDate?: string | null;
	assigneeId: number | null;
	assigneeIds?: number[];
	workflowStageId?: number | null;
	pipelinePosition?: number;
	isInBacklog: boolean;
	totalLoggedMinutes: number;
	allowedActions?: TaskAllowedActions;
	assignee?: TaskAssignee | null;
	assignees?: TaskAssignee[];
	workflowStage?: ProjectWorkflowStage | null;
	milestone?: {
		milestoneId: number;
		title: string;
		status: MilestoneStatus | null;
	} | null;
	project?: {
		projectId: number;
		title: string;
		client?: {
			clientId: number;
			name: string;
		} | null;
	} | null;
	deliverables?: TaskDeliverable[];
	timeEntries?: ProjectTimeEntry[];
	createdAt: string;
	updatedAt: string;
}

export interface Milestone {
	milestoneId: number;
	projectId: number;
	title: string;
	status: MilestoneStatus | null;
	statusLabel: string | null;
	progressPercentage: number | null;
	paymentStageId: number | null;
	invoiceId: number | null;
	tasks?: ProjectTask[];
	createdAt: string;
	updatedAt: string;
}

export interface ProjectTaskFilters {
	status?: string;
	priority?: TaskPriority;
	milestoneId?: number;
	assigneeId?: number;
	isInBacklog?: boolean;
	dueFrom?: string;
	dueTo?: string;
	search?: string;
}

export type RawProjectTaskResource = Omit<ProjectTask, "priority" | "deliverables" | "timeEntries"> & {
	priority?: TaskPriority | null;
	deliverables?: RawTaskDeliverableResource[];
	timeEntries?: RawProjectTimeEntryResource[];
	parentId?: number | null;
	subtasks?: unknown[];
};

export interface TaskListData {
	tasks: RawProjectTaskResource[];
}

export function mapProjectTaskResource(resource: RawProjectTaskResource): ProjectTask {
	return {
		taskId: resource.taskId,
		projectId: resource.projectId,
		milestoneId: resource.milestoneId,
		title: resource.title,
		description: resource.description,
		coverImageUrl: resource.coverImageUrl,
		status: resource.status,
		statusLabel: resource.statusLabel,
		priority: resource.priority ?? TaskPriority.MEDIUM,
		estimatedHours: resource.estimatedHours,
		startDate: resource.startDate,
		dueDate: resource.dueDate,
		assigneeId: resource.assigneeId,
		assigneeIds: resource.assigneeIds,
		workflowStageId: resource.workflowStageId,
		pipelinePosition: resource.pipelinePosition,
		isInBacklog: resource.isInBacklog,
		totalLoggedMinutes: resource.totalLoggedMinutes,
		allowedActions: resource.allowedActions,
		assignee: resource.assignee,
		assignees: resource.assignees,
		workflowStage: resource.workflowStage,
		milestone: resource.milestone,
		project: resource.project,
		deliverables: mapTaskDeliverableList(resource.deliverables),
		timeEntries: mapProjectTimeEntryList(resource.timeEntries),
		createdAt: resource.createdAt,
		updatedAt: resource.updatedAt,
	};
}

export function mapProjectTaskListData(taskListData: TaskListData): ProjectTask[] {
	return taskListData.tasks.map(mapProjectTaskResource);
}

export function buildProjectTaskQuery(filters?: ProjectTaskFilters): string {
	const params = new URLSearchParams();

	if (filters?.status) params.append("filter[status]", filters.status);
	if (filters?.priority) params.append("filter[priority]", filters.priority);
	if (filters?.milestoneId) params.append("filter[milestoneId]", String(filters.milestoneId));
	if (filters?.assigneeId) params.append("filter[assigneeId]", String(filters.assigneeId));
	if (typeof filters?.isInBacklog === "boolean") params.append("filter[isInBacklog]", String(filters.isInBacklog));
	if (filters?.dueFrom) params.append("filter[dueFrom]", filters.dueFrom);
	if (filters?.dueTo) params.append("filter[dueTo]", filters.dueTo);
	if (filters?.search) params.append("filter[search]", filters.search);

	return params.toString();
}
