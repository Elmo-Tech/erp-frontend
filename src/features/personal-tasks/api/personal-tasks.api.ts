"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/base";
import { hrKeys } from "@/entities/hr/model/query-keys";
import { executionKeys } from "@/features/projects/api/execution.api";

interface ApiEnvelope<T> {
	data: T;
	success: boolean;
	message: string;
}

export type PersonalTaskStatus = "todo" | "in_progress" | "done";

export interface PersonalTimeEntry {
	entryId: number;
	personalTaskId: number;
	userId: number;
	startTime: string | null;
	endTime: string | null;
	durationMinutes: number | null;
	isManual: boolean;
	isRunning: boolean;
	note: string | null;
	task?: {
		taskId: number;
		title: string;
		status: PersonalTaskStatus;
	} | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface PersonalTask {
	taskId: number;
	title: string;
	description: string | null;
	status: PersonalTaskStatus;
	dueDate: string | null;
	estimatedMinutes: number | null;
	totalLoggedMinutes: number;
	completedAt: string | null;
	timeEntries?: PersonalTimeEntry[];
	createdAt?: string;
	updatedAt?: string;
}

export interface CreatePersonalTaskPayload {
	title: string;
	description?: string | null;
	status?: PersonalTaskStatus;
	dueDate?: string | null;
	estimatedMinutes?: number | null;
}

export type UpdatePersonalTaskPayload = Partial<CreatePersonalTaskPayload>;

export interface LogPersonalTimePayload {
	startTime: string;
	endTime: string;
	note?: string | null;
}

interface PersonalTaskListData {
	tasks: PersonalTask[];
}

export const personalTaskKeys = {
	all: ["personal-tasks"] as const,
	list: () => [...personalTaskKeys.all, "list"] as const,
	activeTimeEntry: () => [...personalTaskKeys.all, "time-entries", "active"] as const,
};

export const personalTasksApi = {
	async list(): Promise<PersonalTask[]> {
		const response = await api.get<ApiEnvelope<PersonalTaskListData>>("/personal-tasks");
		return response.data.data.tasks;
	},

	async getActiveTimeEntry(): Promise<PersonalTimeEntry | null> {
		const response = await api.get<ApiEnvelope<PersonalTimeEntry | null>>("/personal-tasks/time-entries/active");
		return response.data.data;
	},

	async create(payload: CreatePersonalTaskPayload): Promise<PersonalTask> {
		const response = await api.post<ApiEnvelope<PersonalTask>>("/personal-tasks", payload);
		return response.data.data;
	},

	async update(taskId: number, payload: UpdatePersonalTaskPayload): Promise<PersonalTask> {
		const response = await api.patch<ApiEnvelope<PersonalTask>>(`/personal-tasks/${taskId}`, payload);
		return response.data.data;
	},

	async delete(taskId: number): Promise<void> {
		await api.delete(`/personal-tasks/${taskId}`);
	},

	async complete(taskId: number): Promise<PersonalTask> {
		const response = await api.post<ApiEnvelope<PersonalTask>>(`/personal-tasks/${taskId}/complete`);
		return response.data.data;
	},

	async toggleTimer(taskId: number): Promise<PersonalTimeEntry> {
		const response = await api.post<ApiEnvelope<PersonalTimeEntry>>(`/personal-tasks/${taskId}/time-entries/toggle`);
		return response.data.data;
	},

	async logTime(taskId: number, payload: LogPersonalTimePayload): Promise<PersonalTimeEntry> {
		const response = await api.post<ApiEnvelope<PersonalTimeEntry>>(`/personal-tasks/${taskId}/time-entries`, payload);
		return response.data.data;
	},
};

function invalidatePersonalTaskQueries(queryClient: ReturnType<typeof useQueryClient>) {
	queryClient.invalidateQueries({ queryKey: personalTaskKeys.list() });
	queryClient.invalidateQueries({ queryKey: personalTaskKeys.activeTimeEntry() });
	queryClient.invalidateQueries({ queryKey: executionKeys.activeTimeEntry() });
	queryClient.invalidateQueries({ queryKey: hrKeys.attendance() });
	queryClient.invalidateQueries({ queryKey: hrKeys.teamPulse() });
}

export function usePersonalTasks() {
	return useQuery({
		queryKey: personalTaskKeys.list(),
		queryFn: personalTasksApi.list,
		staleTime: 60 * 1000,
		refetchInterval: 60 * 1000,
	});
}

export function useActivePersonalTimeEntry() {
	return useQuery({
		queryKey: personalTaskKeys.activeTimeEntry(),
		queryFn: personalTasksApi.getActiveTimeEntry,
		staleTime: 15 * 1000,
		refetchInterval: 30 * 1000,
	});
}

export function useCreatePersonalTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: personalTasksApi.create,
		onSuccess: () => invalidatePersonalTaskQueries(queryClient),
	});
}

export function useUpdatePersonalTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ taskId, payload }: { taskId: number; payload: UpdatePersonalTaskPayload }) => personalTasksApi.update(taskId, payload),
		onSuccess: () => invalidatePersonalTaskQueries(queryClient),
	});
}

export function useDeletePersonalTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: personalTasksApi.delete,
		onSuccess: () => invalidatePersonalTaskQueries(queryClient),
	});
}

export function useCompletePersonalTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: personalTasksApi.complete,
		onSuccess: () => invalidatePersonalTaskQueries(queryClient),
	});
}

export function useTogglePersonalTaskTimer() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: personalTasksApi.toggleTimer,
		onSuccess: () => {
			invalidatePersonalTaskQueries(queryClient);
			queryClient.invalidateQueries({ queryKey: executionKeys.myActiveTasks() });
		},
	});
}
