import api from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/features/monitoring/types/api";
import { TaskTemplate, CreateTaskTemplateData, UpdateTaskTemplateData, TaskTemplateFilters, InstantiateTaskData } from "../types/taskTemplate";
import { Task } from "../types/task";

export const taskTemplatesApi = {
	/**
	 * Get all task templates with optional filters
	 */
	getAll: (filters?: TaskTemplateFilters) => api.get<ApiResponse<PaginatedResponse<TaskTemplate>>>("/task-templates", { params: filters }),

	/**
	 * Get a specific task template
	 */
	getById: (id: number) => api.get<ApiResponse<{ template: TaskTemplate }>>(`/task-templates/${id}`),

	/**
	 * Create a new task template
	 */
	create: (data: CreateTaskTemplateData) => api.post<ApiResponse<{ template: TaskTemplate }>>("/task-templates", data),

	/**
	 * Update a task template
	 */
	update: (id: number, data: UpdateTaskTemplateData) => api.put<ApiResponse<{ template: TaskTemplate }>>(`/task-templates/${id}`, data),

	/**
	 * Delete a task template
	 */
	delete: (id: number) => api.delete<ApiResponse<{ message: string }>>(`/task-templates/${id}`),

	/**
	 * Instantiate a task from a template
	 */
	instantiate: (id: number, data: InstantiateTaskData) => api.post<ApiResponse<{ task: Task }>>(`/task-templates/${id}/instantiate`, data),
};
