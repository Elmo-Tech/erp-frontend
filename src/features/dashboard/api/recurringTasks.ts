import api from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/features/monitoring/types/api";
import { RecurringTaskConfig, CreateRecurringTaskData, UpdateRecurringTaskData, RecurringTaskFilters } from "../types/recurringTask";
import { Task } from "../types/task";

export const recurringTasksApi = {
	/**
	 * Get all recurring task configurations with optional filters
	 */
	getAll: (filters?: RecurringTaskFilters) => api.get<ApiResponse<PaginatedResponse<RecurringTaskConfig>>>("/recurring-tasks", { params: filters }),

	/**
	 * Get a specific recurring task configuration
	 */
	getById: (id: number) => api.get<ApiResponse<{ config: RecurringTaskConfig }>>(`/recurring-tasks/${id}`),

	/**
	 * Create a new recurring task configuration
	 */
	create: (data: CreateRecurringTaskData) => api.post<ApiResponse<{ config: RecurringTaskConfig }>>("/recurring-tasks", data),

	/**
	 * Update a recurring task configuration
	 */
	update: (id: number, data: UpdateRecurringTaskData) => api.put<ApiResponse<{ config: RecurringTaskConfig }>>(`/recurring-tasks/${id}`, data),

	/**
	 * Delete a recurring task configuration
	 */
	delete: (id: number) => api.delete<ApiResponse<{ message: string }>>(`/recurring-tasks/${id}`),

	/**
	 * Manually generate the next task from a recurring configuration
	 */
	generateNext: (id: number) => api.post<ApiResponse<{ task: Task }>>(`/recurring-tasks/${id}/generate`),
};
