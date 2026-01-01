/**
 * Tasks Hooks
 * TanStack Query hooks for task management with recursive hierarchy
 *
 * Requirements: 10.3
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../api/tasks";
import { Task, TaskListResponse, CreateTaskPayload, UpdateTaskPayload, TaskFilters } from "../types/task";

/**
 * Query keys for consistent cache management
 */
export const taskKeys = {
	all: ["tasks"] as const,
	lists: () => [...taskKeys.all, "list"] as const,
	list: (filters?: TaskFilters) => [...taskKeys.lists(), filters] as const,
	details: () => [...taskKeys.all, "detail"] as const,
	detail: (id: number) => [...taskKeys.details(), id] as const,
	children: () => [...taskKeys.all, "children"] as const,
	taskChildren: (id: number) => [...taskKeys.children(), id] as const,
};

/**
 * Hook to fetch all tasks with optional filtering and pagination
 * Requirement 10.3: Frontend hooks for task operations
 */
export const useTasks = (filters?: TaskFilters) => {
	return useQuery<TaskListResponse, Error>({
		queryKey: taskKeys.list(filters),
		queryFn: () => tasksApi.getTasks(filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to fetch a single task by ID
 * Requirement 10.3: Frontend hooks for task operations
 */
export const useTask = (id: number, enabled = true) => {
	return useQuery<Task, Error>({
		queryKey: taskKeys.detail(id),
		queryFn: () => tasksApi.getTask(id),
		enabled: enabled && !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to create a new task
 * Requirement 10.3: Frontend hooks for task operations
 */
export const useCreateTask = () => {
	const queryClient = useQueryClient();

	return useMutation<Task, Error, CreateTaskPayload>({
		mutationFn: tasksApi.createTask,
		onSuccess: (newTask) => {
			// Invalidate and refetch tasks list
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });

			// Add the new task to the cache
			queryClient.setQueryData(taskKeys.detail(newTask.taskId), newTask);

			// If task has a parent, invalidate parent's children cache
			if (newTask.parentId) {
				queryClient.invalidateQueries({ queryKey: taskKeys.taskChildren(newTask.parentId) });
			}
		},
		onError: (error) => {
			console.error("Failed to create task:", error);
		},
	});
};

/**
 * Hook to update an existing task
 * Requirement 10.3: Frontend hooks for task operations
 */
export const useUpdateTask = () => {
	const queryClient = useQueryClient();

	return useMutation<Task, Error, { id: number; payload: UpdateTaskPayload }>({
		mutationFn: ({ id, payload }) => tasksApi.updateTask(id, payload),
		onSuccess: (updatedTask, variables) => {
			// Update the specific task in cache
			queryClient.setQueryData(taskKeys.detail(updatedTask.taskId), updatedTask);

			// Invalidate lists to ensure consistency
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });

			// If parent changed, invalidate both old and new parent children
			const oldTask = queryClient.getQueryData<Task>(taskKeys.detail(variables.id));
			if (oldTask?.parentId !== updatedTask.parentId) {
				if (oldTask?.parentId) {
					queryClient.invalidateQueries({ queryKey: taskKeys.taskChildren(oldTask.parentId) });
				}
				if (updatedTask.parentId) {
					queryClient.invalidateQueries({ queryKey: taskKeys.taskChildren(updatedTask.parentId) });
				}
			}

			// If task has children and time was updated, invalidate parent hierarchy
			if (updatedTask.totalTimeSpent !== oldTask?.totalTimeSpent && updatedTask.parentId) {
				queryClient.invalidateQueries({ queryKey: taskKeys.detail(updatedTask.parentId) });
			}
		},
		onError: (error) => {
			console.error("Failed to update task:", error);
		},
	});
};

/**
 * Hook to delete a task
 * Requirement 10.3: Frontend hooks for task operations
 */
export const useDeleteTask = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: tasksApi.deleteTask,
		onSuccess: (_, deletedId) => {
			// Get task data before removal to handle parent invalidation
			const deletedTask = queryClient.getQueryData<Task>(taskKeys.detail(deletedId));

			// Remove the task from cache
			queryClient.removeQueries({ queryKey: taskKeys.detail(deletedId) });

			// Invalidate lists to ensure consistency
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });

			// If task had a parent, invalidate parent's children cache
			if (deletedTask?.parentId) {
				queryClient.invalidateQueries({ queryKey: taskKeys.taskChildren(deletedTask.parentId) });
			}
		},
		onError: (error) => {
			console.error("Failed to delete task:", error);
		},
	});
};

/**
 * Hook to prefetch a task (useful for hover states or navigation)
 * Requirement 10.3: Frontend hooks for task operations
 */
export const usePrefetchTask = () => {
	const queryClient = useQueryClient();

	return (id: number) => {
		queryClient.prefetchQuery({
			queryKey: taskKeys.detail(id),
			queryFn: () => tasksApi.getTask(id),
			staleTime: 5 * 60 * 1000, // 5 minutes
		});
	};
};
