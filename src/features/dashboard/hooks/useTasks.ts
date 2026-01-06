/**
 * Tasks Hooks
 * TanStack Query hooks for task management with recursive hierarchy
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../api/tasks";
import {
	Task,
	TaskListResponse,
	CreateTaskPayload,
	UpdateTaskPayload,
	TaskFilters,
	Tag,
	TaskAssignee,
	AddAssigneePayload,
	TaskTestScenario,
	AddTestScenarioPayload,
	VerifyTestScenarioPayload,
	TaskActivity,
	AddCommentPayload,
	UserPointsSummary,
} from "../types/task";

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
	projectTasks: (projectId: number) => [...taskKeys.all, "project", projectId] as const,
	tags: () => ["tags"] as const,
	testScenarios: (taskId: number) => [...taskKeys.all, "test-scenarios", taskId] as const,
	activities: (taskId: number) => [...taskKeys.all, "activities", taskId] as const,
	pointsSummary: (projectId: number) => [...taskKeys.all, "points-summary", projectId] as const,
};

// ============ Task CRUD Hooks ============

/**
 * Hook to fetch all tasks with optional filtering and pagination
 */
export const useTasks = (filters?: TaskFilters) => {
	return useQuery<TaskListResponse, Error>({
		queryKey: taskKeys.list(filters),
		queryFn: () => tasksApi.getTasks(filters),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

/**
 * Hook to fetch a single task by ID
 */
export const useTask = (id: number, enabled = true) => {
	return useQuery<Task, Error>({
		queryKey: taskKeys.detail(id),
		queryFn: () => tasksApi.getTask(id),
		enabled: enabled && !!id,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

/**
 * Hook to fetch tasks for a specific project
 */
export const useProjectTasks = (projectId: number, page = 1, perPage = 15, enabled = true) => {
	return useQuery<TaskListResponse, Error>({
		queryKey: [...taskKeys.projectTasks(projectId), page, perPage],
		queryFn: () => tasksApi.getProjectTasks(projectId, page, perPage),
		enabled: enabled && !!projectId,
		staleTime: 5 * 60 * 1000, // 5 minutes - rely on invalidation after mutations
		gcTime: 10 * 60 * 1000,
		refetchOnWindowFocus: false, // Don't refetch on window focus to reduce requests
	});
};

/**
 * Hook to create a new task
 */
export const useCreateTask = () => {
	const queryClient = useQueryClient();

	return useMutation<Task, Error, CreateTaskPayload>({
		mutationFn: tasksApi.createTask,
		onSuccess: (newTask) => {
			// Invalidate all task lists
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
			queryClient.invalidateQueries({ queryKey: taskKeys.projectTasks(newTask.projectId) });

			// Set the new task in cache
			queryClient.setQueryData(taskKeys.detail(newTask.taskId), newTask);

			// Invalidate parent's children if this is a child task
			if (newTask.parentId) {
				queryClient.invalidateQueries({ queryKey: taskKeys.taskChildren(newTask.parentId) });
				queryClient.invalidateQueries({ queryKey: taskKeys.detail(newTask.parentId) });
			}

			// Invalidate all children queries
			queryClient.invalidateQueries({ queryKey: taskKeys.children() });

			// Invalidate project details
			queryClient.invalidateQueries({ queryKey: ["projects", "detail", newTask.projectId] });
		},
	});
};

/**
 * Hook to update an existing task
 */
export const useUpdateTask = () => {
	const queryClient = useQueryClient();

	return useMutation<Task, Error, { id: number; payload: UpdateTaskPayload }>({
		mutationFn: ({ id, payload }) => tasksApi.updateTask(id, payload),
		onSuccess: (updatedTask, variables) => {
			// Update the specific task in cache
			queryClient.setQueryData(taskKeys.detail(updatedTask.taskId), updatedTask);

			// Invalidate all task lists
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });

			// Invalidate project tasks
			queryClient.invalidateQueries({ queryKey: taskKeys.projectTasks(updatedTask.projectId) });

			// Invalidate all children queries (for time updates propagation)
			queryClient.invalidateQueries({ queryKey: taskKeys.children() });

			// Handle parent change
			const oldTask = queryClient.getQueryData<Task>(taskKeys.detail(variables.id));
			if (oldTask?.parentId !== updatedTask.parentId) {
				if (oldTask?.parentId) {
					queryClient.invalidateQueries({ queryKey: taskKeys.taskChildren(oldTask.parentId) });
					queryClient.invalidateQueries({ queryKey: taskKeys.detail(oldTask.parentId) });
				}
				if (updatedTask.parentId) {
					queryClient.invalidateQueries({ queryKey: taskKeys.taskChildren(updatedTask.parentId) });
					queryClient.invalidateQueries({ queryKey: taskKeys.detail(updatedTask.parentId) });
				}
			}

			// Invalidate parent task to update aggregated time
			if (updatedTask.parentId) {
				queryClient.invalidateQueries({ queryKey: taskKeys.detail(updatedTask.parentId) });
			}

			// Invalidate project details for total time update
			queryClient.invalidateQueries({ queryKey: ["projects", "detail", updatedTask.projectId] });
		},
	});
};

/**
 * Hook to delete a task
 */
export const useDeleteTask = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, { id: number; projectId: number }>({
		mutationFn: ({ id }) => tasksApi.deleteTask(id),
		onSuccess: (_, { id, projectId }) => {
			const deletedTask = queryClient.getQueryData<Task>(taskKeys.detail(id));

			// Remove the task from cache
			queryClient.removeQueries({ queryKey: taskKeys.detail(id) });

			// Invalidate all task lists
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
			queryClient.invalidateQueries({ queryKey: taskKeys.projectTasks(projectId) });

			// Invalidate all children queries
			queryClient.invalidateQueries({ queryKey: taskKeys.children() });

			// Invalidate parent if exists
			if (deletedTask?.parentId) {
				queryClient.invalidateQueries({ queryKey: taskKeys.taskChildren(deletedTask.parentId) });
				queryClient.invalidateQueries({ queryKey: taskKeys.detail(deletedTask.parentId) });
			}

			// Invalidate project details
			queryClient.invalidateQueries({ queryKey: ["projects", "detail", projectId] });
		},
	});
};

// ============ Tags Hooks ============

/**
 * Hook to fetch all available tags
 */
export const useTags = () => {
	return useQuery<Tag[], Error>({
		queryKey: taskKeys.tags(),
		queryFn: tasksApi.getTags,
		staleTime: 30 * 60 * 1000, // 30 minutes - tags don't change often
		gcTime: 60 * 60 * 1000,
	});
};

// ============ Assignee Hooks ============

/**
 * Hook to add an assignee to a task
 */
export const useAddAssignee = () => {
	const queryClient = useQueryClient();

	return useMutation<TaskAssignee, Error, { taskId: number; projectId: number; payload: AddAssigneePayload }>({
		mutationFn: ({ taskId, payload }) => tasksApi.addAssignee(taskId, payload),
		onSuccess: (_, { taskId, projectId }) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.activities(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.projectTasks(projectId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.children() });
		},
	});
};

/**
 * Hook to remove an assignee from a task
 */
export const useRemoveAssignee = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, { taskId: number; projectId: number; userId: number }>({
		mutationFn: ({ taskId, userId }) => tasksApi.removeAssignee(taskId, userId),
		onSuccess: (_, { taskId, projectId }) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.activities(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.projectTasks(projectId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.children() });
		},
	});
};

// ============ Test Scenario Hooks ============

/**
 * Hook to fetch test scenarios for a task
 */
export const useTestScenarios = (taskId: number, enabled = true) => {
	return useQuery<TaskTestScenario[], Error>({
		queryKey: taskKeys.testScenarios(taskId),
		queryFn: () => tasksApi.getTestScenarios(taskId),
		enabled: enabled && !!taskId,
		staleTime: 5 * 60 * 1000,
	});
};

/**
 * Hook to add a test scenario to a task
 */
export const useAddTestScenario = () => {
	const queryClient = useQueryClient();

	return useMutation<TaskTestScenario, Error, { taskId: number; projectId: number; payload: AddTestScenarioPayload }>({
		mutationFn: ({ taskId, payload }) => tasksApi.addTestScenario(taskId, payload),
		onSuccess: (_, { taskId, projectId }) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.testScenarios(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.projectTasks(projectId) });
		},
	});
};

/**
 * Hook to mark a test scenario as completed
 */
export const useCompleteTestScenario = () => {
	const queryClient = useQueryClient();

	return useMutation<TaskTestScenario, Error, { scenarioId: number; taskId: number; projectId: number }>({
		mutationFn: ({ scenarioId }) => tasksApi.completeTestScenario(scenarioId),
		onSuccess: (_, { taskId, projectId }) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.testScenarios(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.activities(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.projectTasks(projectId) });
		},
	});
};

/**
 * Hook to verify a test scenario
 */
export const useVerifyTestScenario = () => {
	const queryClient = useQueryClient();

	return useMutation<TaskTestScenario, Error, { scenarioId: number; taskId: number; projectId: number; payload: VerifyTestScenarioPayload }>({
		mutationFn: ({ scenarioId, payload }) => tasksApi.verifyTestScenario(scenarioId, payload),
		onSuccess: (_, { taskId, projectId }) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.testScenarios(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.activities(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.projectTasks(projectId) });
		},
	});
};

// ============ Activity & Comment Hooks ============

/**
 * Hook to fetch activities for a task
 */
export const useTaskActivities = (taskId: number, enabled = true) => {
	return useQuery<TaskActivity[], Error>({
		queryKey: taskKeys.activities(taskId),
		queryFn: () => tasksApi.getActivities(taskId),
		enabled: enabled && !!taskId,
		staleTime: 2 * 60 * 1000, // 2 minutes - activities change more frequently
	});
};

/**
 * Hook to add a comment to a task
 */
export const useAddComment = () => {
	const queryClient = useQueryClient();

	return useMutation<TaskActivity, Error, { taskId: number; payload: AddCommentPayload }>({
		mutationFn: ({ taskId, payload }) => tasksApi.addComment(taskId, payload),
		onSuccess: (_, { taskId }) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.activities(taskId) });
		},
	});
};

// ============ Points Summary Hook ============

/**
 * Hook to fetch user points summary for a project
 */
export const usePointsSummary = (projectId: number, enabled = true) => {
	return useQuery<UserPointsSummary[], Error>({
		queryKey: taskKeys.pointsSummary(projectId),
		queryFn: () => tasksApi.getPointsSummary(projectId),
		enabled: enabled && !!projectId,
		staleTime: 5 * 60 * 1000,
	});
};

/**
 * Hook to prefetch a task
 */
export const usePrefetchTask = () => {
	const queryClient = useQueryClient();

	return (id: number) => {
		queryClient.prefetchQuery({
			queryKey: taskKeys.detail(id),
			queryFn: () => tasksApi.getTask(id),
			staleTime: 5 * 60 * 1000,
		});
	};
};
