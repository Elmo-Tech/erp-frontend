/**
 * Task Types
 * Type definitions for task management with recursive hierarchy
 *
 * Requirements: 9.4, 10.2
 */

/**
 * Task status enum matching backend TaskStatus
 */
export enum TaskStatus {
	TODO = "todo",
	IN_PROGRESS = "in_progress",
	REVIEW = "review",
	TESTING = "testing",
	COMPLETED = "completed",
}

/**
 * Task status labels for UI display
 */
export const TaskStatusLabels: Record<TaskStatus, string> = {
	[TaskStatus.TODO]: "To Do",
	[TaskStatus.IN_PROGRESS]: "In Progress",
	[TaskStatus.REVIEW]: "Review",
	[TaskStatus.TESTING]: "Testing",
	[TaskStatus.COMPLETED]: "Completed",
};

/**
 * Task status colors for UI display
 */
export const TaskStatusColors: Record<TaskStatus, string> = {
	[TaskStatus.TODO]: "bg-gray-100 text-gray-800",
	[TaskStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
	[TaskStatus.REVIEW]: "bg-yellow-100 text-yellow-800",
	[TaskStatus.TESTING]: "bg-purple-100 text-purple-800",
	[TaskStatus.COMPLETED]: "bg-green-100 text-green-800",
};

/**
 * Assignee information
 */
export interface TaskAssignee {
	userId: number;
	name: string;
}

/**
 * Task interface with recursive hierarchy support
 * internalReviewerNotes is optional - only present if user has permission
 */
export interface Task {
	taskId: number;
	projectId: number;
	parentId: number | null;
	assignedTo: number | null;
	title: string;
	description: string;
	status: TaskStatus;
	estimatedHours: number;
	totalTimeSpent: number;
	reopenCount: number;
	internalReviewerNotes?: string; // Only present if user has view_internal_notes permission
	assignee?: TaskAssignee;
	children?: Task[];
	createdAt: string;
	updatedAt: string;
	createdBy: number;
	updatedBy: number;
}

/**
 * Task creation payload
 */
export interface CreateTaskPayload {
	projectId: number;
	parentId?: number | null;
	assignedTo?: number | null;
	title: string;
	description?: string;
	status?: TaskStatus;
	estimatedHours?: number;
	internalReviewerNotes?: string;
}

/**
 * Task update payload
 */
export interface UpdateTaskPayload {
	parentId?: number | null;
	assignedTo?: number | null;
	title?: string;
	description?: string;
	status?: TaskStatus;
	estimatedHours?: number;
	internalReviewerNotes?: string;
}

/**
 * Task filters for querying tasks
 */
export interface TaskFilters {
	projectId?: number;
	parentId?: number | null;
	status?: TaskStatus;
	assignedTo?: number;
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
 * GET /api/v1/tasks
 */
export interface TaskListResponse {
	tasks: Task[];
	pagination: TaskPagination;
}

/**
 * Response structure for task children endpoint
 * GET /api/v1/tasks/{id}/children
 */
export interface TaskChildrenResponse {
	children: Task[];
}
