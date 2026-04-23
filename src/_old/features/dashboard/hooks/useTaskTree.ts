/**
 * Task Tree Hooks
 * TanStack Query hooks for hierarchical task fetching with lazy loading
 *
 * Requirements: 9.5
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../api/tasks";
import { Task, TaskChildrenResponse } from "../types/task";
import { taskKeys } from "./useTasks";

/**
 * Hook to fetch children of a specific task for lazy loading
 * Requirement 9.5: Support lazy loading of children for performance optimization
 */
export const useTaskChildren = (parentId: number, enabled = true) => {
	return useQuery<TaskChildrenResponse, Error>({
		queryKey: taskKeys.taskChildren(parentId),
		queryFn: () => tasksApi.getTaskChildren(parentId),
		enabled: enabled && !!parentId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to manage hierarchical task tree state with lazy loading
 * Requirement 9.5: Support lazy loading of children for performance optimization
 */
export const useTaskTree = (projectId: number) => {
	const queryClient = useQueryClient();

	// Fetch root level tasks (tasks with no parent)
	const rootTasksQuery = useQuery<Task[], Error>({
		queryKey: [...taskKeys.lists(), { projectId, parentId: null }],
		queryFn: async () => {
			const response = await tasksApi.getTasks({
				projectId,
				parentId: null,
				perPage: 100, // Get all root tasks
			});
			return response.tasks;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});

	/**
	 * Prefetch children for a task (useful for expand operations)
	 */
	const prefetchChildren = (taskId: number) => {
		queryClient.prefetchQuery({
			queryKey: taskKeys.taskChildren(taskId),
			queryFn: () => tasksApi.getTaskChildren(taskId),
			staleTime: 5 * 60 * 1000, // 5 minutes
		});
	};

	/**
	 * Get cached children for a task if available
	 */
	const getCachedChildren = (taskId: number): Task[] | undefined => {
		const childrenData = queryClient.getQueryData<TaskChildrenResponse>(taskKeys.taskChildren(taskId));
		return childrenData?.children;
	};

	/**
	 * Check if children are loaded for a task
	 */
	const areChildrenLoaded = (taskId: number): boolean => {
		const queryState = queryClient.getQueryState(taskKeys.taskChildren(taskId));
		return queryState?.status === "success";
	};

	/**
	 * Check if children are currently loading for a task
	 */
	const areChildrenLoading = (taskId: number): boolean => {
		const queryState = queryClient.getQueryState(taskKeys.taskChildren(taskId));
		return queryState?.status === "pending";
	};

	/**
	 * Invalidate children cache for a task (useful after updates)
	 */
	const invalidateChildren = (taskId: number) => {
		queryClient.invalidateQueries({ queryKey: taskKeys.taskChildren(taskId) });
	};

	/**
	 * Recursively expand a task tree path
	 * Useful for deep-linking to a specific task
	 */
	const expandPath = async (taskPath: number[]): Promise<void> => {
		for (const taskId of taskPath) {
			if (!areChildrenLoaded(taskId)) {
				await queryClient.fetchQuery({
					queryKey: taskKeys.taskChildren(taskId),
					queryFn: () => tasksApi.getTaskChildren(taskId),
				});
			}
		}
	};

	return {
		// Root tasks query
		rootTasks: rootTasksQuery.data || [],
		isLoadingRootTasks: rootTasksQuery.isLoading,
		rootTasksError: rootTasksQuery.error,

		// Children management
		prefetchChildren,
		getCachedChildren,
		areChildrenLoaded,
		areChildrenLoading,
		invalidateChildren,
		expandPath,

		// Utility functions
		refetchRootTasks: rootTasksQuery.refetch,
	};
};

/**
 * Hook to build a flattened task hierarchy for search/filtering
 * Requirement 9.5: Support hierarchical task operations
 */
export const useFlatTaskTree = (projectId: number) => {
	const { rootTasks, isLoadingRootTasks } = useTaskTree(projectId);
	const queryClient = useQueryClient();

	/**
	 * Recursively flatten task tree including cached children
	 */
	const flattenTasks = (tasks: Task[], level = 0): Array<Task & { level: number }> => {
		const flattened: Array<Task & { level: number }> = [];

		for (const task of tasks) {
			// Add current task with level
			flattened.push({ ...task, level });

			// Add children if they're cached
			const children = queryClient.getQueryData<TaskChildrenResponse>(taskKeys.taskChildren(task.taskId))?.children;

			if (children && children.length > 0) {
				flattened.push(...flattenTasks(children, level + 1));
			}
		}

		return flattened;
	};

	const flatTasks = flattenTasks(rootTasks);

	return {
		flatTasks,
		isLoading: isLoadingRootTasks,
		taskCount: flatTasks.length,
	};
};

/**
 * Hook to find task ancestors path
 * Useful for breadcrumb navigation
 */
export const useTaskAncestors = (taskId: number) => {
	const queryClient = useQueryClient();

	return useQuery<Task[], Error>({
		queryKey: [...taskKeys.all, "ancestors", taskId],
		queryFn: async () => {
			const ancestors: Task[] = [];
			let currentTask = queryClient.getQueryData<Task>(taskKeys.detail(taskId));

			// If task not in cache, fetch it
			if (!currentTask) {
				currentTask = await tasksApi.getTask(taskId);
			}

			// Walk up the parent chain
			while (currentTask?.parentId) {
				let parentTask: Task | undefined = queryClient.getQueryData<Task>(taskKeys.detail(currentTask.parentId));

				// If parent not in cache, fetch it
				if (!parentTask) {
					parentTask = await tasksApi.getTask(currentTask.parentId);
				}

				ancestors.unshift(parentTask);
				currentTask = parentTask;
			}

			return ancestors;
		},
		enabled: !!taskId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};
