import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { taskDependenciesApi } from "../api";
import { CreateTaskDependencyData } from "../types";

/**
 * Hook to fetch task dependencies
 */
export function useTaskDependencies(taskId: number) {
	return useQuery({
		queryKey: ["task-dependencies", taskId],
		queryFn: () => taskDependenciesApi.getTaskDependencies(taskId).then((res) => res.data.data.dependencies),
		enabled: !!taskId,
	});
}

/**
 * Hook to create a task dependency
 */
export function useCreateTaskDependency(taskId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateTaskDependencyData) => taskDependenciesApi.createTaskDependency(taskId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["task-dependencies", taskId],
			});
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success("Dependency created successfully");
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to create dependency";
			toast.error(message);
		},
	});
}

/**
 * Hook to delete a task dependency
 */
export function useDeleteTaskDependency(taskId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (dependencyId: number) => taskDependenciesApi.deleteTaskDependency(dependencyId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["task-dependencies", taskId],
			});
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success("Dependency removed successfully");
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to remove dependency";
			toast.error(message);
		},
	});
}
