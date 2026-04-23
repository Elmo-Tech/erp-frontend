import api from "@/shared/api/base";
import { ApiResponse } from "@/_old/features/monitoring/types/api";
import { TaskDependency, CreateTaskDependencyData } from "../types/taskDependency";

export const taskDependenciesApi = {
	/**
	 * Get all dependencies for a task
	 */
	getTaskDependencies: (taskId: number) => api.get<ApiResponse<{ dependencies: TaskDependency[] }>>(`/tasks/${taskId}/dependencies`),

	/**
	 * Create a new task dependency
	 */
	createTaskDependency: (taskId: number, data: CreateTaskDependencyData) => api.post<ApiResponse<{ dependency: TaskDependency }>>(`/tasks/${taskId}/dependencies`, data),

	/**
	 * Delete a task dependency
	 */
	deleteTaskDependency: (dependencyId: number) => api.delete<ApiResponse<{ message: string }>>(`/task-dependencies/${dependencyId}`),
};
