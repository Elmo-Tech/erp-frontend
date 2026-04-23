import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { recurringTasksApi } from "../api";
import { CreateRecurringTaskData, UpdateRecurringTaskData, RecurringTaskFilters } from "../types";

/**
 * Hook to fetch all recurring task configurations with optional filters
 */
export function useRecurringTasks(filters?: RecurringTaskFilters) {
	return useQuery({
		queryKey: ["recurring-tasks", filters],
		queryFn: () => recurringTasksApi.getAll(filters).then((res) => res.data.data),
	});
}

/**
 * Hook to fetch a single recurring task configuration
 */
export function useRecurringTask(id: number) {
	return useQuery({
		queryKey: ["recurring-tasks", id],
		queryFn: () => recurringTasksApi.getById(id).then((res) => res.data.data.config),
		enabled: !!id,
	});
}

/**
 * Hook to create a recurring task configuration
 */
export function useCreateRecurringTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRecurringTaskData) => recurringTasksApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
			toast.success("Recurring task created successfully");
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error, "Failed to create recurring task"));
		},
	});
}

/**
 * Hook to update a recurring task configuration
 */
export function useUpdateRecurringTask(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateRecurringTaskData) => recurringTasksApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
			queryClient.invalidateQueries({ queryKey: ["recurring-tasks", id] });
			toast.success("Recurring task updated successfully");
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error, "Failed to update recurring task"));
		},
	});
}

/**
 * Hook to delete a recurring task configuration
 */
export function useDeleteRecurringTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => recurringTasksApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
			toast.success("Recurring task deleted successfully");
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error, "Failed to delete recurring task"));
		},
	});
}

/**
 * Hook to manually generate the next task from a recurring configuration
 */
export function useGenerateNextTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => recurringTasksApi.generateNext(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success("Task generated successfully");
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error, "Failed to generate task"));
		},
	});
}
