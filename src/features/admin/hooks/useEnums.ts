/**
 * Hooks for fetching enum data (user specializations and task categories)
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import {
	UserSpecializationsResponse,
	TaskCategoriesResponse,
	CompatibleTaskCategoriesResponse,
	UserSpecialization,
	ProjectStatusesResponse,
	TaskStatusesResponse
} from "../types/enums";

/**
 * Fetch all user specializations
 */
export function useUserSpecializations() {
	return useQuery({
		queryKey: ["enums", "user-specializations"],
		queryFn: async (): Promise<UserSpecializationsResponse> => {
			const response = await api.get("/enums/user-specializations");
			return response.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Fetch all task categories
 */
export function useTaskCategories() {
	return useQuery({
		queryKey: ["enums", "task-categories"],
		queryFn: async (): Promise<TaskCategoriesResponse> => {
			const response = await api.get("/enums/task-categories");
			return response.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Fetch task categories compatible with a specific user specialization
 */
export function useCompatibleTaskCategories(specialization?: UserSpecialization | string) {
	return useQuery({
		queryKey: ["enums", "compatible-task-categories", specialization],
		queryFn: async (): Promise<CompatibleTaskCategoriesResponse> => {
			const response = await api.get(`/enums/compatible-task-categories/${specialization}`);
			return response.data;
		},
		enabled: !!specialization,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Fetch all active project statuses
 */
export function useProjectStatuses() {
	return useQuery({
		queryKey: ["enums", "project-statuses"],
		queryFn: async (): Promise<ProjectStatusesResponse> => {
			const response = await api.get("/enums/project-statuses");
			return response.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Fetch all active task statuses
 */
export function useTaskStatuses() {
	return useQuery({
		queryKey: ["enums", "task-statuses"],
		queryFn: async (): Promise<TaskStatusesResponse> => {
			const response = await api.get("/enums/task-statuses");
			return response.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
