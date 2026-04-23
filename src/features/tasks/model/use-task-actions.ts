"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "@/entities/project/model/query-keys";
import { taskApi } from "@/entities/task/api/task.api";
import { taskKeys } from "@/entities/task/model/query-keys";
import type {
	AddAssigneePayload,
	AddCommentPayload,
	AddTestScenarioPayload,
	CreateTaskPayload,
	Task,
	TaskActivity,
	TaskAssignee,
	TaskTestScenario,
	UpdateTaskPayload,
	VerifyTestScenarioPayload,
} from "@/entities/task/model/types";

function invalidateTaskCollections(queryClient: ReturnType<typeof useQueryClient>, task?: Pick<Task, "projectId" | "parentId" | "taskId">) {
	queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
	queryClient.invalidateQueries({ queryKey: taskKeys.myAssignedRoot() });
	queryClient.invalidateQueries({ queryKey: taskKeys.children() });

	if (task?.projectId) {
		queryClient.invalidateQueries({ queryKey: taskKeys.projectTasksRoot(task.projectId) });
		queryClient.invalidateQueries({ queryKey: projectKeys.detail(task.projectId) });
	}

	if (task?.parentId) {
		queryClient.invalidateQueries({ queryKey: taskKeys.taskChildren(task.parentId) });
		queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.parentId) });
	}
}

export function useCreateTask() {
	const queryClient = useQueryClient();

	return useMutation<Task, Error, CreateTaskPayload>({
		mutationFn: taskApi.createTask,
		onSuccess: (newTask) => {
			queryClient.setQueryData(taskKeys.detail(newTask.taskId), newTask);
			invalidateTaskCollections(queryClient, newTask);
		},
	});
}

export function useUpdateTask() {
	const queryClient = useQueryClient();

	return useMutation<Task, Error, { id: number; payload: UpdateTaskPayload }>({
		mutationFn: ({ id, payload }) => taskApi.updateTask(id, payload),
		onSuccess: (updatedTask, variables) => {
			const previousTask = queryClient.getQueryData<Task>(taskKeys.detail(variables.id));

			queryClient.setQueryData(taskKeys.detail(updatedTask.taskId), updatedTask);
			invalidateTaskCollections(queryClient, updatedTask);

			if (previousTask?.parentId && previousTask.parentId !== updatedTask.parentId) {
				queryClient.invalidateQueries({ queryKey: taskKeys.taskChildren(previousTask.parentId) });
				queryClient.invalidateQueries({ queryKey: taskKeys.detail(previousTask.parentId) });
			}
		},
	});
}

export function useMarkTaskComplete() {
	const queryClient = useQueryClient();

	return useMutation<Task, Error, { id: number; reason?: string }>({
		mutationFn: ({ id, reason }) => taskApi.markComplete(id, reason),
		onSuccess: (updatedTask) => {
			queryClient.setQueryData(taskKeys.detail(updatedTask.taskId), updatedTask);
			queryClient.invalidateQueries({ queryKey: taskKeys.activities(updatedTask.taskId) });
			invalidateTaskCollections(queryClient, updatedTask);
		},
	});
}

export function useDeleteTask() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, { id: number; projectId?: number | null }>({
		mutationFn: ({ id }) => taskApi.deleteTask(id),
		onSuccess: (_, { id, projectId }) => {
			const deletedTask = queryClient.getQueryData<Task>(taskKeys.detail(id));

			queryClient.removeQueries({ queryKey: taskKeys.detail(id) });
			invalidateTaskCollections(queryClient, deletedTask ?? { projectId, parentId: null, taskId: id });
		},
	});
}

export function useAddTaskAssignee() {
	const queryClient = useQueryClient();

	return useMutation<TaskAssignee, Error, { taskId: number; projectId?: number | null; payload: AddAssigneePayload }>({
		mutationFn: ({ taskId, payload }) => taskApi.addAssignee(taskId, payload),
		onSuccess: (_, { taskId, projectId }) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.activities(taskId) });
			if (projectId) {
				queryClient.invalidateQueries({ queryKey: taskKeys.projectTasksRoot(projectId) });
			}
		},
	});
}

export function useRemoveTaskAssignee() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, { taskId: number; projectId?: number | null; userId: number }>({
		mutationFn: ({ taskId, userId }) => taskApi.removeAssignee(taskId, userId),
		onSuccess: (_, { taskId, projectId }) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.activities(taskId) });
			if (projectId) {
				queryClient.invalidateQueries({ queryKey: taskKeys.projectTasksRoot(projectId) });
			}
		},
	});
}

export function useAddTaskTestScenario() {
	const queryClient = useQueryClient();

	return useMutation<TaskTestScenario, Error, { taskId: number; projectId?: number | null; payload: AddTestScenarioPayload }>({
		mutationFn: ({ taskId, payload }) => taskApi.addTestScenario(taskId, payload),
		onSuccess: (_, { taskId, projectId }) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.testScenarios(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
			if (projectId) {
				queryClient.invalidateQueries({ queryKey: taskKeys.projectTasksRoot(projectId) });
			}
		},
	});
}

export function useCompleteTaskTestScenario() {
	const queryClient = useQueryClient();

	return useMutation<TaskTestScenario, Error, { scenarioId: number; taskId: number; projectId?: number | null }>({
		mutationFn: ({ scenarioId }) => taskApi.completeTestScenario(scenarioId),
		onSuccess: (_, { taskId, projectId }) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.testScenarios(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.activities(taskId) });
			if (projectId) {
				queryClient.invalidateQueries({ queryKey: taskKeys.projectTasksRoot(projectId) });
			}
		},
	});
}

export function useVerifyTaskTestScenario() {
	const queryClient = useQueryClient();

	return useMutation<TaskTestScenario, Error, { scenarioId: number; taskId: number; projectId?: number | null; payload: VerifyTestScenarioPayload }>({
		mutationFn: ({ scenarioId, payload }) => taskApi.verifyTestScenario(scenarioId, payload),
		onSuccess: (_, { taskId, projectId }) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.testScenarios(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.activities(taskId) });
			if (projectId) {
				queryClient.invalidateQueries({ queryKey: taskKeys.projectTasksRoot(projectId) });
			}
		},
	});
}

export function useAddTaskComment() {
	const queryClient = useQueryClient();

	return useMutation<TaskActivity, Error, { taskId: number; payload: AddCommentPayload }>({
		mutationFn: ({ taskId, payload }) => taskApi.addComment(taskId, payload),
		onSuccess: (_, { taskId }) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.activities(taskId) });
		},
	});
}
