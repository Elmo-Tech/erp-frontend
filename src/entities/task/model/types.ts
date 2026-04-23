import {
	DeliverableStatus,
	DeliverableStatusColors,
	DeliverableStatusLabels,
	TASK_STATUS_TRANSITIONS,
	TaskPriority,
	TaskPriorityColors,
	TaskPriorityLabels,
	TaskStatus,
	TaskStatusColors,
	TaskStatusLabels,
	canTaskTransitionTo,
	getAvailableTaskTransitions,
} from "@/shared/lib/statusHelpers";

export {
	DeliverableStatus,
	DeliverableStatusColors,
	DeliverableStatusLabels,
	TASK_STATUS_TRANSITIONS,
	TaskPriority,
	TaskPriorityColors,
	TaskPriorityLabels,
	TaskStatus,
	TaskStatusColors,
	TaskStatusLabels,
	canTaskTransitionTo,
	getAvailableTaskTransitions,
};

export enum TaskType {
	MAIN = "main",
	WEEKLY = "weekly",
	SUBTASK = "subtask",
}

export enum AssigneeRole {
	DEVELOPER = "developer",
	REVIEWER = "reviewer",
	LEAD = "lead",
}

export enum TestScenarioStatus {
	PENDING = "pending",
	PASSED = "passed",
	FAILED = "failed",
}

export const TaskTypeLabels: Record<TaskType, string> = {
	[TaskType.MAIN]: "Main Task",
	[TaskType.WEEKLY]: "Weekly Task",
	[TaskType.SUBTASK]: "Subtask",
};

export const AssigneeRoleLabels: Record<AssigneeRole, string> = {
	[AssigneeRole.DEVELOPER]: "Developer",
	[AssigneeRole.REVIEWER]: "Reviewer",
	[AssigneeRole.LEAD]: "Lead",
};

export interface Tag {
	tagId: number;
	name: string;
	slug: string;
	color: string;
}

export interface TaskUserSummary {
	userId: number;
	name: string;
	email?: string;
	avatar?: string | null;
}

export interface TaskAssignee {
	assigneeId: number;
	taskId: number;
	userId: number;
	role: AssigneeRole;
	isPrimary: boolean;
	pointsEarned: number;
	user?: TaskUserSummary;
	createdAt: string;
}

export interface TaskTestScenario {
	scenarioId: number;
	taskId: number;
	title: string;
	description: string;
	expectedResult: string;
	status: TestScenarioStatus;
	order: number;
	completedBy?: Pick<TaskUserSummary, "userId" | "name">;
	completedAt: string | null;
	verifiedBy?: Pick<TaskUserSummary, "userId" | "name">;
	verifiedAt: string | null;
	reviewerNotes: string | null;
	createdAt: string;
}

export interface TaskActivity {
	activityId: number;
	taskId: number;
	userId: number;
	type: string;
	description: string;
	comment: string | null;
	isInternal: boolean;
	metadata: Record<string, unknown>;
	user?: Pick<TaskUserSummary, "userId" | "name" | "avatar">;
	createdAt: string;
}

export interface TaskDeliverable {
	deliverableId: number;
	taskId: number;
	title: string;
	description?: string | null;
	acceptanceCriteria?: string | null;
	status: DeliverableStatus;
	submissionNotes?: string | null;
	reviewNotes?: string | null;
	submittedAt?: string | null;
	reviewedAt?: string | null;
	reviewedBy?: Pick<TaskUserSummary, "userId" | "name">;
	pointsAwarded: number;
	isBonus: boolean;
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface SimpleAssignee {
	userId: number;
	name: string;
}

export interface DeliveryStatus {
	isCompleted: boolean;
	completedAt: string | null;
	dueDate: string | null;
	delayDays: number | null;
	isOverdue: boolean;
	isEarly: boolean;
	isOnTime: boolean;
	statusText: string;
	statusColor: "default" | "success" | "warning" | "destructive";
}

export interface Task {
	taskId: number;
	projectId?: number | null;
	parentId: number | null;
	assignedTo: number | null;
	title: string;
	description: string | null;
	acceptanceCriteria: string | null;
	status: TaskStatus;
	type: TaskType;
	priority: TaskPriority;
	taskCategory?: string | null;
	dueDate: string | null;
	expectedResolutionDate: string | null;
	startDate: string | null;
	sprintNumber: number | null;
	estimatedHours: number;
	totalTimeSpent: number;
	reopenCount: number;
	testCompletionPercentage: number;
	canStartTimer: boolean;
	hasChildren: boolean;
	internalReviewerNotes?: string | null;
	completedAt: string | null;
	delayDays: number | null;
	deliveryStatus?: DeliveryStatus;
	isOverdue: boolean;
	daysUntilDue: number | null;
	assignee?: SimpleAssignee | null;
	assignees?: TaskAssignee[];
	teamAssignees?: TaskAssignee[] | null;
	tags?: Tag[];
	testScenarios?: TaskTestScenario[];
	deliverables?: TaskDeliverable[];
	children?: Task[];
	project?: {
		projectId: number;
		title: string;
	} | null;
	parent?: {
		taskId: number;
		title: string;
	} | null;
	createdAt: string;
	updatedAt: string;
	createdBy: number;
	updatedBy: number;
}

export interface TaskAssigneeInput {
	userId: number;
	role: AssigneeRole;
	isPrimary?: boolean;
}

export interface CreateTaskPayload {
	projectId?: number;
	parentId?: number | null;
	assignedTo?: number | null;
	title: string;
	description?: string;
	acceptanceCriteria?: string;
	status?: TaskStatus;
	type?: TaskType;
	priority?: TaskPriority;
	taskCategory?: string;
	dueDate?: string | null;
	expectedResolutionDate?: string | null;
	startDate?: string | null;
	sprintNumber?: number | null;
	estimatedHours?: number;
	internalReviewerNotes?: string;
	tagIds?: number[];
	assignees?: TaskAssigneeInput[];
}

export interface UpdateTaskPayload {
	parentId?: number | null;
	assignedTo?: number | null;
	title?: string;
	description?: string;
	acceptanceCriteria?: string;
	status?: TaskStatus;
	type?: TaskType;
	priority?: TaskPriority;
	taskCategory?: string;
	dueDate?: string | null;
	expectedResolutionDate?: string | null;
	startDate?: string | null;
	sprintNumber?: number | null;
	estimatedHours?: number;
	internalReviewerNotes?: string;
	tagIds?: number[];
}

export interface AddAssigneePayload {
	userId: number;
	role: AssigneeRole;
	isPrimary?: boolean;
}

export interface AddTestScenarioPayload {
	title: string;
	description?: string;
	expectedResult?: string;
}

export interface VerifyTestScenarioPayload {
	passed: boolean;
	notes?: string;
}

export interface AddCommentPayload {
	comment: string;
	isInternal?: boolean;
}

export interface TaskFilters {
	projectId?: number;
	parentId?: number | null;
	status?: TaskStatus;
	type?: TaskType;
	priority?: TaskPriority;
	assignedTo?: number;
	tagId?: number;
	search?: string;
	page?: number;
	perPage?: number;
}

export interface TaskPagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

export interface TaskListResponse {
	tasks: Task[];
	pagination: TaskPagination;
}

export interface TaskChildrenResponse {
	children: Task[];
}

export interface UserPointsSummary {
	userId: number;
	userName: string;
	totalPoints: number;
}

export interface TaskKanbanColumn {
	status: TaskStatus;
	label: string;
}

export interface TaskDragPayload {
	type: "task";
	taskId: number;
	fromStatus: TaskStatus;
}

export interface TaskStatusDropPayload {
	type: "task-status";
	status: TaskStatus;
}
