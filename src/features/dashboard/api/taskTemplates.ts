import api from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/features/monitoring/types/api";
import { TaskTemplate, CreateTaskTemplateData, UpdateTaskTemplateData, TaskTemplateFilters, InstantiateTaskData } from "../types/taskTemplate";
import { Task } from "../types/task";

export const taskTemplatesApi = {
	/**
	 * Get all task templates with optional filters
	 */
	getAll: async (filters?: TaskTemplateFilters) => {
		const params = new URLSearchParams();

		if (filters?.search) params.append("filter[search]", filters.search);
		if (filters?.category) params.append("filter[category]", filters.category);
		if (filters?.isActive !== undefined) params.append("filter[is_active]", filters.isActive ? "1" : "0");
		if (filters?.page) params.append("page", filters.page.toString());
		if (filters?.perPage) params.append("per_page", filters.perPage.toString());

		const queryString = params.toString();
		const url = queryString ? `/task-templates?${queryString}` : "/task-templates";

		return api.get<ApiResponse<PaginatedResponse<TaskTemplate>>>(url);
	},

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
