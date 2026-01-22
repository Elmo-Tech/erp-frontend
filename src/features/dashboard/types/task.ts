/**
 * Task Types
 * Type definitions for task management with recursive hierarchy
 */

// Re-export enums from centralized statusHelpers
export { TaskStatus, TaskStatusLabels, TaskStatusColors, TaskPriority, TaskPriorityLabels, TaskPriorityColors } from "@/lib/statusHelpers";
import { TaskStatus, TaskPriority } from "@/lib/statusHelpers";

/**
 * Task type enum matching backend TaskType
 */
export enum TaskType {
	MAIN = "main",
	WEEKLY = "weekly",
	SUBTASK = "subtask",
}

/**
 * Assignee role enum
 */
export enum AssigneeRole {
	DEVELOPER = "developer",
	REVIEWER = "reviewer",
	LEAD = "lead",
}

/**
 * Test scenario status
 */
export enum TestScenarioStatus {
	PENDING = "pending",
	PASSED = "passed",
	FAILED = "failed",
}

/**
 * Task type labels for UI display
 */
export const TaskTypeLabels: Record<TaskType, string> = {
	[TaskType.MAIN]: "Main Task",
	[TaskType.WEEKLY]: "Weekly Task",
	[TaskType.SUBTASK]: "Subtask",
};

/**
 * Task type colors for UI display
 */
export const TaskTypeColors: Record<TaskType, string> = {
	[TaskType.MAIN]: "bg-indigo-100 text-indigo-800 border-indigo-300",
	[TaskType.WEEKLY]: "bg-cyan-100 text-cyan-800 border-cyan-300",
	[TaskType.SUBTASK]: "bg-slate-100 text-slate-700 border-slate-300",
};

/**
 * Task type icons (for reference in components)
 */
export const TaskTypeIcons: Record<TaskType, string> = {
	[TaskType.MAIN]: "folder",
	[TaskType.WEEKLY]: "calendar-days",
	[TaskType.SUBTASK]: "list-check",
};

/**
 * Assignee role labels
 */
export const AssigneeRoleLabels: Record<AssigneeRole, string> = {
	[AssigneeRole.DEVELOPER]: "Developer",
	[AssigneeRole.REVIEWER]: "Reviewer",
	[AssigneeRole.LEAD]: "Lead",
};

/**
 * Tag interface
 */
export interface Tag {
	tagId: number;
	name: string;
	slug: string;
	color: string;
}

/**
 * Task assignee interface
 */
export interface TaskAssignee {
	assigneeId: number;
	taskId: number;
	userId: number;
	role: AssigneeRole;
	isPrimary: boolean;
	pointsEarned: number;
	user?: {
		userId: number;
		name: string;
		email: string;
		avatar: string;
	};
	createdAt: string;
}

/**
 * Test scenario interface
 */
export interface TaskTestScenario {
	scenarioId: number;
	taskId: number;
	title: string;
	description: string;
	expectedResult: string;
	status: TestScenarioStatus;
	order: number;
	completedBy?: {
		userId: number;
		name: string;
	};
	completedAt: string | null;
	verifiedBy?: {
		userId: number;
		name: string;
	};
	verifiedAt: string | null;
	reviewerNotes: string | null;
	createdAt: string;
}

/**
 * Task activity interface
 */
export interface TaskActivity {
	activityId: number;
	taskId: number;
	userId: number;
	type: string;
	description: string;
	comment: string | null;
	isInternal: boolean;
	metadata: Record<string, unknown>;
	user?: {
		userId: number;
		name: string;
		avatar: string;
	};
	createdAt: string;
}

/**
 * Simple assignee info (legacy support)
 */
export interface SimpleAssignee {
	userId: number;
	name: string;
}

/**
 * Task interface with recursive hierarchy support
 */
export interface Task {
	taskId: number;
	projectId: number;
	parentId: number | null;
	assignedTo: number | null;
	title: string;
	description: string;
	acceptanceCriteria: string;
	status: TaskStatus;
	type: TaskType;
	priority: TaskPriority;
	taskCategory?: string;
	dueDate: string | null;
	startDate: string | null;
	sprintNumber: number | null;
	estimatedHours: number;
	totalTimeSpent: number;
	reopenCount: number;
	testCompletionPercentage: number;
	canStartTimer: boolean; // Timer only allowed on leaf tasks (no children)
	hasChildren: boolean;
	internalReviewerNotes?: string; // Only present if user has view_internal_notes permission

	// Delivery tracking
	completedAt: string | null;
	delayDays: number | null;
	deliveryStatus: DeliveryStatus;
	isOverdue: boolean;
	daysUntilDue: number | null;

	assignee?: SimpleAssignee;
	assignees?: TaskAssignee[];
	teamAssignees?: TaskAssignee[] | null; // Available team members from Main Task (for Weekly/Subtasks only)
	tags?: Tag[];
	testScenarios?: TaskTestScenario[];
	children?: Task[];
	project?: {
		projectId: number;
		title: string;
	};
	parent?: {
		taskId: number;
		title: string;
	};
	createdAt: string;
	updatedAt: string;
	createdBy: number;
	updatedBy: number;
}

/**
 * Delivery status information
 */
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

/**
 * Task creation payload
 */
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
	startDate?: string | null;
	sprintNumber?: number | null;
	estimatedHours?: number;
	internalReviewerNotes?: string;
	tagIds?: number[];
	assignees?: {
		userId: number;
		role: AssigneeRole;
		isPrimary?: boolean;
	}[];
}

/**
 * Task update payload
 */
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
	startDate?: string | null;
	sprintNumber?: number | null;
	estimatedHours?: number;
	internalReviewerNotes?: string;
	tagIds?: number[];
}

/**
 * Add assignee payload
 */
export interface AddAssigneePayload {
	userId: number;
	role: AssigneeRole;
	isPrimary?: boolean;
}

/**
 * Add test scenario payload
 */
export interface AddTestScenarioPayload {
	title: string;
	description?: string;
	expectedResult?: string;
}

/**
 * Verify test scenario payload
 */
export interface VerifyTestScenarioPayload {
	passed: boolean;
	notes?: string;
}

/**
 * Add comment payload
 */
export interface AddCommentPayload {
	comment: string;
	isInternal?: boolean;
}

/**
 * Task filters for querying tasks
 */
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

/**
 * Pagination metadata for task lists
 */
export interface TaskPagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

/**
 * Response structure for task list endpoint
 */
export interface TaskListResponse {
	tasks: Task[];
	pagination: TaskPagination;
}

/**
 * Response structure for task children endpoint
 */
export interface TaskChildrenResponse {
	children: Task[];
}

/**
 * User points summary
 */
export interface UserPointsSummary {
	userId: number;
	userName: string;
	totalPoints: number;
}
