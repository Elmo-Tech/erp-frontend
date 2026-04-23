/**
 * Tasks API
 * API functions for task management with recursive hierarchy
 */

import api from "@/shared/api/base";
import {
	Task,
	TaskListResponse,
	TaskChildrenResponse,
	TaskFilters,
	CreateTaskPayload,
	UpdateTaskPayload,
	Tag,
	TaskAssignee,
	AddAssigneePayload,
	TaskTestScenario,
	AddTestScenarioPayload,
	VerifyTestScenarioPayload,
	TaskActivity,
	AddCommentPayload,
	UserPointsSummary,
} from "../types/task";

/**
 * API functions for task operations
 */
export const tasksApi = {
	/**
	 * Get all tasks with optional filtering and pagination
	 */
	getTasks: async (filters?: TaskFilters): Promise<TaskListResponse> => {
		const params = new URLSearchParams();

		if (filters?.projectId) {
			params.append("filter[projectId]", filters.projectId.toString());
		}
		if (filters?.parentId !== undefined) {
			if (filters.parentId === null) {
				params.append("filter[parentId]", "null");
			} else {
				params.append("filter[parentId]", filters.parentId.toString());
			}
		}
		if (filters?.status) {
			params.append("filter[status]", filters.status);
		}
		if (filters?.type) {
			params.append("filter[type]", filters.type);
		}
		if (filters?.priority) {
			params.append("filter[priority]", filters.priority);
		}
		if (filters?.assignedTo) {
			params.append("filter[assignedTo]", filters.assignedTo.toString());
		}
		if (filters?.tagId) {
			params.append("filter[tagId]", filters.tagId.toString());
		}
		if (filters?.search) {
			params.append("filter[search]", filters.search);
		}
		if (filters?.page) {
			params.append("page", filters.page.toString());
		}
		if (filters?.perPage) {
			params.append("perPage", filters.perPage.toString());
		}

		const queryString = params.toString();
		const url = queryString ? `/tasks?${queryString}` : "/tasks";

		const response = await api.get<{ data: TaskListResponse }>(url);
		return response.data.data;
	},

	/**
	 * Get tasks where current user is assigned as team member
	 */
	getMyAssignedTasks: async (filters?: TaskFilters): Promise<TaskListResponse> => {
		const params = new URLSearchParams();

		if (filters?.projectId) {
			params.append("filter[projectId]", filters.projectId.toString());
		}
		if (filters?.status) {
			params.append("filter[status]", filters.status);
		}
		if (filters?.type) {
			params.append("filter[type]", filters.type);
		}
		if (filters?.priority) {
			params.append("filter[priority]", filters.priority);
		}
		if (filters?.search) {
			params.append("filter[search]", filters.search);
		}
		if (filters?.page) {
			params.append("page", filters.page.toString());
		}
		if (filters?.perPage) {
			params.append("perPage", filters.perPage.toString());
		}

		const queryString = params.toString();
		const url = queryString ? `/tasks/my-assigned?${queryString}` : "/tasks/my-assigned";

		const response = await api.get<{ data: TaskListResponse }>(url);
		return response.data.data;
	},

	/**
	 * Get a single task by ID
	 */
	getTask: async (id: number): Promise<Task> => {
		const response = await api.get<{ data: Task }>(`/tasks/${id}`);
		return response.data.data;
	},

	/**
	 * Create a new task
	 */
	createTask: async (payload: CreateTaskPayload): Promise<Task> => {
		const response = await api.post<{ data: Task }>("/tasks", payload);
		return response.data.data;
	},

	/**
	 * Update an existing task
	 */
	updateTask: async (id: number, payload: UpdateTaskPayload): Promise<Task> => {
		const response = await api.put<{ data: Task }>(`/tasks/${id}`, payload);
		return response.data.data;
	},

	/**
	 * Mark a task as complete with timeline validation
	 */
	markComplete: async (id: number, reason?: string): Promise<Task> => {
		const payload = reason ? { reason } : {};
		const response = await api.post<{ data: Task }>(`/tasks/${id}/mark-complete`, payload);
		return response.data.data;
	},

	/**
	 * Delete a task
	 */
	deleteTask: async (id: number): Promise<void> => {
		await api.delete(`/tasks/${id}`);
	},

	/**
	 * Get children of a specific task for lazy loading
	 */
	getTaskChildren: async (id: number): Promise<TaskChildrenResponse> => {
		const response = await api.get<{ data: Task[] }>(`/tasks/${id}/children`);
		return { children: response.data.data };
	},

	/**
	 * Get tasks for a specific project
	 */
	getProjectTasks: async (projectId: number, page = 1, perPage = 15): Promise<TaskListResponse> => {
		const response = await api.get<{ data: TaskListResponse }>(`/projects/${projectId}/tasks?page=${page}&perPage=${perPage}`);
		return response.data.data;
	},

	// ============ Tags ============

	/**
	 * Get all available tags
	 */
	getTags: async (): Promise<Tag[]> => {
		const response = await api.get<{ data: Tag[] }>("/tags");
		return response.data.data;
	},

	// ============ Assignees ============

	/**
	 * Add an assignee to a task
	 */
	addAssignee: async (taskId: number, payload: AddAssigneePayload): Promise<TaskAssignee> => {
		const response = await api.post<{ data: TaskAssignee }>(`/tasks/${taskId}/assignees`, payload);
		return response.data.data;
	},

	/**
	 * Remove an assignee from a task
	 */
	removeAssignee: async (taskId: number, userId: number): Promise<void> => {
		await api.delete(`/tasks/${taskId}/assignees/${userId}`);
	},

	// ============ Test Scenarios ============

	/**
	 * Get test scenarios for a task
	 */
	getTestScenarios: async (taskId: number): Promise<TaskTestScenario[]> => {
		const response = await api.get<{ data: TaskTestScenario[] }>(`/tasks/${taskId}/test-scenarios`);
		return response.data.data;
	},

	/**
	 * Add a test scenario to a task
	 */
	addTestScenario: async (taskId: number, payload: AddTestScenarioPayload): Promise<TaskTestScenario> => {
		const response = await api.post<{ data: TaskTestScenario }>(`/tasks/${taskId}/test-scenarios`, payload);
		return response.data.data;
	},

	/**
	 * Mark a test scenario as completed by developer
	 */
	completeTestScenario: async (scenarioId: number): Promise<TaskTestScenario> => {
		const response = await api.post<{ data: TaskTestScenario }>(`/test-scenarios/${scenarioId}/complete`);
		return response.data.data;
	},

	/**
	 * Verify a test scenario by reviewer
	 */
	verifyTestScenario: async (scenarioId: number, payload: VerifyTestScenarioPayload): Promise<TaskTestScenario> => {
		const response = await api.post<{ data: TaskTestScenario }>(`/test-scenarios/${scenarioId}/verify`, payload);
		return response.data.data;
	},

	// ============ Activities & Comments ============

	/**
	 * Get activity log for a task
	 */
	getActivities: async (taskId: number): Promise<TaskActivity[]> => {
		const response = await api.get<{ data: TaskActivity[] }>(`/tasks/${taskId}/activities`);
		return response.data.data;
	},

	/**
	 * Add a comment to a task
	 */
	addComment: async (taskId: number, payload: AddCommentPayload): Promise<TaskActivity> => {
		const response = await api.post<{ data: TaskActivity }>(`/tasks/${taskId}/comments`, payload);
		return response.data.data;
	},

	// ============ Points Summary ============

	/**
	 * Get user points summary for a project
	 */
	getPointsSummary: async (projectId: number): Promise<UserPointsSummary[]> => {
		const response = await api.get<{ data: UserPointsSummary[] }>(`/projects/${projectId}/points-summary`);
		return response.data.data;
	},
};
