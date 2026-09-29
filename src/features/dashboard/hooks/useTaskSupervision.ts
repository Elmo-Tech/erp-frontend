import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskSupervisionApi } from "../api/taskSupervision";
import { taskKeys } from "./useTasks";
import type {
	CreateTaskHelpRequestPayload,
	SetTaskSupervisorPayload,
	StartTaskSupervisionSessionPayload,
	StopTaskSupervisionSessionPayload,
	TaskHelpRequest,
	TaskSupervision,
	TaskSupervisionSession,
	TaskSupervisionSummaryFilters,
	TaskSupervisionSummaryResponse,
	UpdateTaskHelpRequestPayload,
} from "../types/taskSupervision";
import type { Task } from "../types/task";

const ACTIVE_SUPERVISION_POLL_MS = 15_000;

export const taskSupervisionKeys = {
	all: ["task-supervision"] as const,
	details: () => [...taskSupervisionKeys.all, "detail"] as const,
	detail: (taskId: number) => [...taskSupervisionKeys.details(), taskId] as const,
	active: () => [...taskSupervisionKeys.all, "active"] as const,
	summaries: () => [...taskSupervisionKeys.all, "summary"] as const,
	summary: (filters?: TaskSupervisionSummaryFilters) => [...taskSupervisionKeys.summaries(), filters] as const,
};

function invalidateTaskSupervision(queryClient: ReturnType<typeof useQueryClient>, taskId: number) {
	queryClient.invalidateQueries({ queryKey: taskSupervisionKeys.detail(taskId) });
	queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
}

export const useTaskSupervision = (taskId: number, enabled = true) => {
	return useQuery<TaskSupervision, Error>({
		queryKey: taskSupervisionKeys.detail(taskId),
		queryFn: () => taskSupervisionApi.getTaskSupervision(taskId),
		enabled: enabled && !!taskId,
		staleTime: 30_000,
	});
};

export const useActiveTaskSupervisionSession = (enabled = true) => {
	return useQuery<TaskSupervisionSession | null, Error>({
		queryKey: taskSupervisionKeys.active(),
		queryFn: taskSupervisionApi.getActiveSession,
		enabled,
		staleTime: 0,
		refetchInterval: (query) => (query.state.data?.isActive ? ACTIVE_SUPERVISION_POLL_MS : false),
	});
};

export const useSetTaskSupervisor = () => {
	const queryClient = useQueryClient();

	return useMutation<Task, Error, { taskId: number; projectId: number; payload: SetTaskSupervisorPayload }>({
		mutationFn: ({ taskId, payload }) => taskSupervisionApi.setSupervisor(taskId, payload),
		onSuccess: (task, { taskId, projectId }) => {
			queryClient.setQueryData(taskKeys.detail(task.taskId), task);
			invalidateTaskSupervision(queryClient, taskId);
			queryClient.invalidateQueries({ queryKey: taskKeys.projectTasks(projectId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
			queryClient.invalidateQueries({ queryKey: [...taskKeys.all, "my-assigned"] });
		},
	});
};

export const useCreateTaskHelpRequest = () => {
	const queryClient = useQueryClient();

	return useMutation<TaskHelpRequest, Error, { taskId: number; payload: CreateTaskHelpRequestPayload }>({
		mutationFn: ({ taskId, payload }) => taskSupervisionApi.createHelpRequest(taskId, payload),
		onSuccess: (_, { taskId }) => invalidateTaskSupervision(queryClient, taskId),
	});
};

export const useUpdateTaskHelpRequest = () => {
	const queryClient = useQueryClient();

	return useMutation<TaskHelpRequest, Error, { taskId: number; helpRequestId: number; payload: UpdateTaskHelpRequestPayload }>({
		mutationFn: ({ helpRequestId, payload }) => taskSupervisionApi.updateHelpRequest(helpRequestId, payload),
		onSuccess: (_, { taskId }) => invalidateTaskSupervision(queryClient, taskId),
	});
};

export const useStartTaskSupervisionSession = () => {
	const queryClient = useQueryClient();

	return useMutation<TaskSupervisionSession, Error, { taskId: number; payload: StartTaskSupervisionSessionPayload }>({
		mutationFn: ({ taskId, payload }) => taskSupervisionApi.startSession(taskId, payload),
		onSuccess: (session, { taskId }) => {
			queryClient.setQueryData(taskSupervisionKeys.active(), session);
			invalidateTaskSupervision(queryClient, taskId);
		},
	});
};

export const useHeartbeatTaskSupervisionSession = () => {
	const queryClient = useQueryClient();

	return useMutation<TaskSupervisionSession, Error, { sessionId: number }>({
		mutationFn: ({ sessionId }) => taskSupervisionApi.heartbeatSession(sessionId),
		onSuccess: (session) => queryClient.setQueryData(taskSupervisionKeys.active(), session),
	});
};

export const useStopTaskSupervisionSession = () => {
	const queryClient = useQueryClient();

	return useMutation<TaskSupervisionSession, Error, { taskId: number; sessionId: number; payload: StopTaskSupervisionSessionPayload }>({
		mutationFn: ({ sessionId, payload }) => taskSupervisionApi.stopSession(sessionId, payload),
		onSuccess: (_, { taskId }) => {
			queryClient.setQueryData(taskSupervisionKeys.active(), null);
			invalidateTaskSupervision(queryClient, taskId);
		},
	});
};

export const useTaskSupervisionSummary = (filters?: TaskSupervisionSummaryFilters, enabled = true) => {
	return useQuery<TaskSupervisionSummaryResponse, Error>({
		queryKey: taskSupervisionKeys.summary(filters),
		queryFn: () => taskSupervisionApi.getSummary(filters),
		enabled,
		staleTime: 60_000,
	});
};
