/**
 * Tasks API
 * API functions for task management with recursive hierarchy
 *
 * Requirements: 10.3, 12.4
 */

import api from "@/lib/axios";
import { Task, TaskListResponse, TaskChildrenResponse, TaskFilters, CreateTaskPayload, UpdateTaskPayload } from "../types/task";

/**
 * API functions for task operations
 */
export const tasksApi = {
	/**
	 * Get all tasks with optional filtering and pagination
	 * Requirement 10.3: GET /api/v1/tasks endpoint to list tasks with filtering
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
		if (filters?.assignedTo) {
			params.append("filter[assignedTo]", filters.assignedTo.toString());
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
	 * Get a single task by ID
	 * Requirement 10.3: GET /api/v1/tasks/{id} endpoint to retrieve a single task
	 */
	getTask: async (id: number): Promise<Task> => {
		const response = await api.get<{ data: Task }>(`/tasks/${id}`);
		return response.data.data;
	},

	/**
	 * Create a new task
	 * Requirement 10.3: POST /api/v1/tasks endpoint to create a new task
	 */
	createTask: async (payload: CreateTaskPayload): Promise<Task> => {
		const response = await api.post<{ data: Task }>("/tasks", payload);
		return response.data.data;
	},

	/**
	 * Update an existing task
	 * Requirement 10.3: PUT /api/v1/tasks/{id} endpoint to update a task
	 */
	updateTask: async (id: number, payload: UpdateTaskPayload): Promise<Task> => {
		const response = await api.put<{ data: Task }>(`/tasks/${id}`, payload);
		return response.data.data;
	},

	/**
	 * Delete a task
	 * Requirement 10.3: DELETE /api/v1/tasks/{id} endpoint to delete a task
	 */
	deleteTask: async (id: number): Promise<void> => {
		await api.delete(`/tasks/${id}`);
	},

	/**
	 * Get children of a specific task for lazy loading
	 * Requirement 12.4: GET /api/v1/tasks/{id}/children endpoint for lazy loading children
	 */
	getTaskChildren: async (id: number): Promise<TaskChildrenResponse> => {
		const response = await api.get<{ data: TaskChildrenResponse }>(`/tasks/${id}/children`);
		return response.data.data;
	},
};
