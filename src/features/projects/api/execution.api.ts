"use client";

/**
 * Project Execution API
 *
 * TanStack Query hooks for the Project Execution layer:
 *   - Milestones
 *   - Project Tasks (with filters)
 *   - Task Deliverables (toggle)
 *   - Time Entries (timer toggle)
 *   - Task completion
 *   - Change Requests
 *
 * All endpoints are scoped under /api/v1/projects/{project}/...
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/base";
import { projectKeys } from "@/entities/project/model/query-keys";
import { hrKeys } from "@/entities/hr/model/query-keys";
import type { TaskPriority, MilestoneStatus } from "@/shared/lib/statusHelpers";

// ─────────────────────────────────────────────────────────────────────────────
// API envelope
// ─────────────────────────────────────────────────────────────────────────────

interface ApiEnvelope<T> {
	data: T;
	success: boolean;
	message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript interfaces — mirror backend Resources exactly
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskAssignee {
	userId: number;
	name: string;
	avatar?: string | null;
}

export interface TaskDeliverable {
	deliverableId: number;
	taskId: number;
	title: string;
	isCompleted: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface ProjectTimeEntry {
	entryId: number;
	taskId: number;
	projectId?: number | null;
	userId: number;
	startTime: string | null;
	endTime: string | null;
	durationMinutes: number | null;
	isManual: boolean;
	isRunning: boolean;
	note: string | null;
	user?: TaskAssignee | null;
	task?: {
		taskId: number;
		projectId: number;
		title: string;
		status: string | null;
	} | null;
	project?: {
		projectId: number;
		title: string;
	} | null;
	createdAt: string;
	updatedAt: string;
}

export interface ProjectTask {
	taskId: number;
	projectId: number;
	milestoneId: number | null;
	// REMOVED: parentId - subtasks are no longer supported
	title: string;
	description: string | null;
	status: string;
	statusLabel: string | null;
	estimatedHours: number | null;
	dueDate?: string | null;
	assigneeId: number | null;
	isInBacklog: boolean;
	totalLoggedMinutes: number;
	assignee?: TaskAssignee | null;
	milestone?: {
		milestoneId: number;
		title: string;
		status: MilestoneStatus | null;
	} | null;
	project?: {
		projectId: number;
		title: string;
	} | null;
	// REMOVED: subtasks - subtasks are no longer supported
	deliverables?: TaskDeliverable[];
	timeEntries?: ProjectTimeEntry[];
	createdAt: string;
	updatedAt: string;
}

export interface Milestone {
	milestoneId: number;
	projectId: number;
	title: string;
	status: MilestoneStatus | null;
	statusLabel: string | null;
	progressPercentage: number | null;
	paymentStageId: number | null;
	invoiceId: number | null;
	tasks?: ProjectTask[];
	createdAt: string;
	updatedAt: string;
}

export interface ChangeRequest {
	changeRequestId: number;
	projectId: number;
	title: string;
	description: string | null;
	price: number;
	status: string | null;
	statusLabel: string | null;
	createdAt: string;
	updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Task filter shape
// ─────────────────────────────────────────────────────────────────────────────

export interface ProjectTaskFilters {
	status?: string;
	priority?: TaskPriority;
	milestoneId?: number;
	assigneeId?: number;
	isInBacklog?: boolean;
	search?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Query key extensions for execution sub-resources
// ─────────────────────────────────────────────────────────────────────────────

export const executionKeys = {
	milestones: (projectId: number) => [...projectKeys.detail(projectId), "milestones"] as const,
	tasks: (projectId: number, filters?: ProjectTaskFilters) => [...projectKeys.detail(projectId), "tasks", filters] as const,
	changeRequests: (projectId: number) => [...projectKeys.detail(projectId), "change-requests"] as const,
	activeTimeEntry: () => ["project-execution", "time-entries", "active"] as const,
	myActiveTasks: () => ["project-execution", "tasks", "my-active"] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Milestone hooks
// ─────────────────────────────────────────────────────────────────────────────

interface MilestoneListData {
	milestones: Milestone[];
}

export function useMilestones(projectId: number) {
	return useQuery({
		queryKey: executionKeys.milestones(projectId),
		queryFn: async () => {
			const response = await api.get<ApiEnvelope<MilestoneListData>>(`/projects/${projectId}/milestones`);
			return response.data.data.milestones;
		},
		enabled: Number.isFinite(projectId) && projectId > 0,
		staleTime: 2 * 60 * 1000,
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Task hooks
// ─────────────────────────────────────────────────────────────────────────────

interface TaskListData {
	tasks: ProjectTask[];
}

function buildTaskParams(filters?: ProjectTaskFilters): URLSearchParams {
	const params = new URLSearchParams();
	if (filters?.status) params.append("filter[status]", filters.status);
	if (filters?.priority) params.append("filter[priority]", filters.priority);
	if (filters?.milestoneId) params.append("filter[milestoneId]", String(filters.milestoneId));
	if (filters?.assigneeId) params.append("filter[assigneeId]", String(filters.assigneeId));
	if (typeof filters?.isInBacklog === "boolean") params.append("filter[isInBacklog]", String(filters.isInBacklog));
	if (filters?.search) params.append("filter[search]", filters.search);
	return params;
}

export function useProjectTasks(projectId: number, filters?: ProjectTaskFilters) {
	return useQuery({
		queryKey: executionKeys.tasks(projectId, filters),
		queryFn: async () => {
			const params = buildTaskParams(filters);
			const query = params.toString();
			const url = query ? `/projects/${projectId}/tasks?${query}` : `/projects/${projectId}/tasks`;
			const response = await api.get<ApiEnvelope<TaskListData>>(url);
			return response.data.data.tasks;
		},
		enabled: Number.isFinite(projectId) && projectId > 0,
		staleTime: 60 * 1000,
	});
}

export async function getMyActiveProjectTasks(): Promise<ProjectTask[]> {
	const response = await api.get<ApiEnvelope<TaskListData>>("/projects/tasks/my-active");
	return response.data.data.tasks;
}

export function useMyActiveProjectTasks() {
	return useQuery({
		queryKey: executionKeys.myActiveTasks(),
		queryFn: getMyActiveProjectTasks,
		staleTime: 60 * 1000,
		refetchInterval: 60 * 1000,
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Execution Task Status — mirrors backend ExecutionTaskStatus enum exactly
// ─────────────────────────────────────────────────────────────────────────────

export const ExecutionTaskStatus = {
	BACKLOG: "backlog",
	TO_DO: "to_do",
	IN_PROGRESS: "in_progress",
	IN_REVIEW: "in_review",
	QA: "qa",
	DONE: "done",
} as const;

export type ExecutionTaskStatusValue = (typeof ExecutionTaskStatus)[keyof typeof ExecutionTaskStatus];

export const ExecutionTaskStatusLabels: Record<ExecutionTaskStatusValue, string> = {
	backlog: "Backlog",
	to_do: "To Do",
	in_progress: "In Progress",
	in_review: "In Review",
	qa: "QA",
	done: "Done",
};

export const ExecutionTaskStatusColors: Record<ExecutionTaskStatusValue, string> = {
	backlog: "bg-gray-100 text-gray-700 border-gray-200",
	to_do: "bg-slate-100 text-slate-700 border-slate-200",
	in_progress: "bg-blue-100 text-blue-700 border-blue-200",
	in_review: "bg-yellow-100 text-yellow-700 border-yellow-200",
	qa: "bg-purple-100 text-purple-700 border-purple-200",
	done: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

// All statuses except done — used for the status selector
export const EXECUTION_TASK_STATUS_OPTIONS = [
	{ value: ExecutionTaskStatus.BACKLOG, label: "Backlog" },
	{ value: ExecutionTaskStatus.TO_DO, label: "To Do" },
	{ value: ExecutionTaskStatus.IN_PROGRESS, label: "In Progress" },
	{ value: ExecutionTaskStatus.IN_REVIEW, label: "In Review" },
	{ value: ExecutionTaskStatus.QA, label: "QA" },
	{ value: ExecutionTaskStatus.DONE, label: "Done" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Timer toggle hook — fixed invalidation
// ─────────────────────────────────────────────────────────────────────────────

interface ToggleTimerVars {
	projectId: number;
	taskId: number;
}

export async function getActiveProjectTimeEntry(): Promise<ProjectTimeEntry | null> {
	const response = await api.get<ApiEnvelope<ProjectTimeEntry | null>>("/projects/time-entries/active");
	return response.data.data;
}

export function useActiveProjectTimeEntry() {
	return useQuery({
		queryKey: executionKeys.activeTimeEntry(),
		queryFn: getActiveProjectTimeEntry,
		staleTime: 15 * 1000,
		refetchInterval: 30 * 1000,
	});
}

export function useToggleTaskTimer() {
	const queryClient = useQueryClient();

	return useMutation<ProjectTimeEntry, Error, ToggleTimerVars>({
		mutationFn: async ({ projectId, taskId }) => {
			const response = await api.post<ApiEnvelope<ProjectTimeEntry>>(`/projects/${projectId}/tasks/${taskId}/time-entries/toggle`);
			return response.data.data;
		},
		onSuccess: (_data, { projectId }) => {
			// Invalidate tasks (carries timeEntries + totalLoggedMinutes) and milestones (progress)
			queryClient.invalidateQueries({ queryKey: executionKeys.tasks(projectId) });
			queryClient.invalidateQueries({ queryKey: executionKeys.milestones(projectId) });
			queryClient.invalidateQueries({ queryKey: executionKeys.activeTimeEntry() });
			queryClient.invalidateQueries({ queryKey: executionKeys.myActiveTasks() });
			queryClient.invalidateQueries({ queryKey: ["personal-tasks"] });
			queryClient.invalidateQueries({ queryKey: hrKeys.attendance() });
			queryClient.invalidateQueries({ queryKey: hrKeys.teamPulse() });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Complete task hook
// ─────────────────────────────────────────────────────────────────────────────

interface CompleteTaskVars {
	projectId: number;
	taskId: number;
}

export function useCompleteTask() {
	const queryClient = useQueryClient();

	return useMutation<ProjectTask, Error, CompleteTaskVars>({
		mutationFn: async ({ projectId, taskId }) => {
			const response = await api.post<ApiEnvelope<ProjectTask>>(`/projects/${projectId}/tasks/${taskId}/complete`);
			return response.data.data;
		},
		onSuccess: (_data, { projectId }) => {
			// Refresh tasks and milestones — completion updates milestone progress
			queryClient.invalidateQueries({ queryKey: executionKeys.tasks(projectId) });
			queryClient.invalidateQueries({ queryKey: executionKeys.milestones(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle deliverable hook
// ─────────────────────────────────────────────────────────────────────────────

interface ToggleDeliverableVars {
	projectId: number;
	taskId: number;
	deliverableId: number;
}

export function useToggleDeliverable() {
	const queryClient = useQueryClient();

	return useMutation<TaskDeliverable, Error, ToggleDeliverableVars>({
		mutationFn: async ({ projectId, taskId, deliverableId }) => {
			const response = await api.patch<ApiEnvelope<TaskDeliverable>>(`/projects/${projectId}/tasks/${taskId}/deliverables/${deliverableId}/toggle`);
			return response.data.data;
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: executionKeys.tasks(projectId) });
			queryClient.invalidateQueries({ queryKey: executionKeys.milestones(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Change Request hooks
// ─────────────────────────────────────────────────────────────────────────────

interface ChangeRequestListData {
	changeRequests: ChangeRequest[];
}

export function useChangeRequests(projectId: number) {
	return useQuery({
		queryKey: executionKeys.changeRequests(projectId),
		queryFn: async () => {
			const response = await api.get<ApiEnvelope<ChangeRequestListData>>(`/projects/${projectId}/change-requests`);
			return response.data.data.changeRequests;
		},
		enabled: Number.isFinite(projectId) && projectId > 0,
		staleTime: 2 * 60 * 1000,
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Change Request mutation
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateChangeRequestPayload {
	title: string;
	description: string;
	price: number;
}

interface CreateChangeRequestVars {
	projectId: number;
	payload: CreateChangeRequestPayload;
}

export function useCreateChangeRequest() {
	const queryClient = useQueryClient();

	return useMutation<ChangeRequest, Error, CreateChangeRequestVars>({
		mutationFn: async ({ projectId, payload }) => {
			const response = await api.post<ApiEnvelope<ChangeRequest>>(`/projects/${projectId}/change-requests`, payload);
			return response.data.data;
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: executionKeys.changeRequests(projectId) });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Update Change Request Status mutation
// ─────────────────────────────────────────────────────────────────────────────

interface UpdateChangeRequestStatusVars {
	projectId: number;
	changeRequestId: number;
	status: string;
}

export function useUpdateChangeRequestStatus() {
	const queryClient = useQueryClient();

	return useMutation<ChangeRequest, Error, UpdateChangeRequestStatusVars>({
		mutationFn: async ({ projectId, changeRequestId, status }) => {
			const response = await api.patch<ApiEnvelope<ChangeRequest>>(`/projects/${projectId}/change-requests/${changeRequestId}`, { status });
			return response.data.data;
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: executionKeys.changeRequests(projectId) });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Change Request mutation
// ─────────────────────────────────────────────────────────────────────────────

interface DeleteChangeRequestVars {
	projectId: number;
	changeRequestId: number;
}

export function useDeleteChangeRequest() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, DeleteChangeRequestVars>({
		mutationFn: async ({ projectId, changeRequestId }) => {
			await api.delete(`/projects/${projectId}/change-requests/${changeRequestId}`);
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: executionKeys.changeRequests(projectId) });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Project History (Activity) hooks
// ─────────────────────────────────────────────────────────────────────────────

export interface ProjectHistoryEntry {
	historyId: number;
	projectId: number;
	fieldName: string;
	oldValue: string;
	newValue: string;
	reason: string;
	changedBy: number;
	changedByUser?: {
		userId: number;
		name: string;
		email: string;
	} | null;
	createdAt: string;
	updatedAt: string;
}

interface ProjectHistoryListData {
	histories: ProjectHistoryEntry[];
}

export const historyKeys = {
	history: (projectId: number) => [...projectKeys.detail(projectId), "history"] as const,
};

export function useProjectHistory(projectId: number) {
	return useQuery({
		queryKey: historyKeys.history(projectId),
		queryFn: async () => {
			const response = await api.get<ApiEnvelope<ProjectHistoryListData>>(`/projects/${projectId}/history`);
			return response.data.data.histories;
		},
		enabled: Number.isFinite(projectId) && projectId > 0,
		staleTime: 2 * 60 * 1000,
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Project Members hook
// ─────────────────────────────────────────────────────────────────────────────

export function useProjectMembers(projectId: number) {
	return useQuery({
		queryKey: projectKeys.members(projectId),
		queryFn: async () => {
			const response = await api.get<ApiEnvelope<{ members: ProjectMemberResource[] }>>(`/projects/${projectId}/members`);
			return response.data.data.members;
		},
		enabled: Number.isFinite(projectId) && projectId > 0,
		staleTime: 5 * 60 * 1000,
	});
}

export interface ProjectMemberResource {
	memberId: number;
	projectId: number;
	userId: number;
	role: string;
	user?: {
		userId: number;
		name: string;
		email: string;
		avatar?: string | null;
	} | null;
	createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Milestone mutation
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateMilestonePayload {
	title: string;
}

interface CreateMilestoneVars {
	projectId: number;
	payload: CreateMilestonePayload;
}

export function useCreateMilestone() {
	const queryClient = useQueryClient();

	return useMutation<Milestone, Error, CreateMilestoneVars>({
		mutationFn: async ({ projectId, payload }) => {
			const response = await api.post<ApiEnvelope<Milestone>>(`/projects/${projectId}/milestones`, payload);
			return response.data.data;
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: executionKeys.milestones(projectId) });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Task mutation
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateTaskPayload {
	title: string;
	milestoneId?: number | null;
	// REMOVED: parentId - subtasks are no longer supported
	description?: string;
	estimatedHours?: number | null;
	assigneeId?: number | null;
}

interface CreateTaskVars {
	projectId: number;
	payload: CreateTaskPayload;
}

export function useCreateTask() {
	const queryClient = useQueryClient();

	return useMutation<ProjectTask, Error, CreateTaskVars>({
		mutationFn: async ({ projectId, payload }) => {
			const response = await api.post<ApiEnvelope<ProjectTask>>(`/projects/${projectId}/tasks`, payload);
			return response.data.data;
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: executionKeys.tasks(projectId) });
			queryClient.invalidateQueries({ queryKey: executionKeys.milestones(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Deliverable mutation
// ─────────────────────────────────────────────────────────────────────────────

interface CreateDeliverableVars {
	projectId: number;
	taskId: number;
	title: string;
}

export function useCreateDeliverable() {
	const queryClient = useQueryClient();

	return useMutation<TaskDeliverable, Error, CreateDeliverableVars>({
		mutationFn: async ({ projectId, taskId, title }) => {
			const response = await api.post<ApiEnvelope<TaskDeliverable>>(`/projects/${projectId}/tasks/${taskId}/deliverables`, { title });
			return response.data.data;
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: executionKeys.tasks(projectId) });
			queryClient.invalidateQueries({ queryKey: executionKeys.milestones(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Update / Delete Deliverable mutations
// ─────────────────────────────────────────────────────────────────────────────

interface UpdateDeliverableVars {
	projectId: number;
	taskId: number;
	deliverableId: number;
	title: string;
}

export function useUpdateDeliverable() {
	const queryClient = useQueryClient();

	return useMutation<TaskDeliverable, Error, UpdateDeliverableVars>({
		mutationFn: async ({ projectId, taskId, deliverableId, title }) => {
			const response = await api.patch<ApiEnvelope<TaskDeliverable>>(`/projects/${projectId}/tasks/${taskId}/deliverables/${deliverableId}`, { title });
			return response.data.data;
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: executionKeys.tasks(projectId) });
			queryClient.invalidateQueries({ queryKey: executionKeys.milestones(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
		},
	});
}

interface DeleteDeliverableVars {
	projectId: number;
	taskId: number;
	deliverableId: number;
}

export function useDeleteDeliverable() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, DeleteDeliverableVars>({
		mutationFn: async ({ projectId, taskId, deliverableId }) => {
			await api.delete(`/projects/${projectId}/tasks/${taskId}/deliverables/${deliverableId}`);
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: executionKeys.tasks(projectId) });
			queryClient.invalidateQueries({ queryKey: executionKeys.milestones(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Update Task Status mutation
// ─────────────────────────────────────────────────────────────────────────────

interface UpdateTaskStatusVars {
	projectId: number;
	taskId: number;
	status: string;
	/** Optional reason — required by the backend when reopening a completed/QA task */
	reason?: string;
}

export function useUpdateTaskStatus() {
	const queryClient = useQueryClient();

	return useMutation<ProjectTask, Error, UpdateTaskStatusVars>({
		mutationFn: async ({ projectId, taskId, status, reason }) => {
			const payload: Record<string, unknown> = { status };
			if (reason?.trim()) payload.reason = reason.trim();
			const response = await api.patch<ApiEnvelope<ProjectTask>>(`/projects/${projectId}/tasks/${taskId}`, payload);
			return response.data.data;
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: executionKeys.tasks(projectId) });
			queryClient.invalidateQueries({ queryKey: executionKeys.milestones(projectId) });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Log Manual Time Entry mutation
// ─────────────────────────────────────────────────────────────────────────────

export interface LogManualTimePayload {
	startTime: string; // ISO datetime string
	endTime: string; // ISO datetime string
	note?: string;
}

interface LogManualTimeVars {
	projectId: number;
	taskId: number;
	payload: LogManualTimePayload;
}

export function useLogManualTime() {
	const queryClient = useQueryClient();

	return useMutation<ProjectTimeEntry, Error, LogManualTimeVars>({
		mutationFn: async ({ projectId, taskId, payload }) => {
			const response = await api.post<ApiEnvelope<ProjectTimeEntry>>(`/projects/${projectId}/tasks/${taskId}/time-entries`, payload);
			return response.data.data;
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: executionKeys.tasks(projectId) });
		},
	});
}

interface UpdateTimeEntryVars {
	projectId: number;
	taskId: number;
	entryId: number;
	payload: LogManualTimePayload;
}

export function useUpdateTimeEntry() {
	const queryClient = useQueryClient();

	return useMutation<ProjectTimeEntry, Error, UpdateTimeEntryVars>({
		mutationFn: async ({ projectId, taskId, entryId, payload }) => {
			const response = await api.patch<ApiEnvelope<ProjectTimeEntry>>(`/projects/${projectId}/tasks/${taskId}/time-entries/${entryId}`, payload);
			return response.data.data;
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: executionKeys.tasks(projectId) });
		},
	});
}

interface DeleteTimeEntryVars {
	projectId: number;
	taskId: number;
	entryId: number;
}

export function useDeleteTimeEntry() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, DeleteTimeEntryVars>({
		mutationFn: async ({ projectId, taskId, entryId }) => {
			await api.delete(`/projects/${projectId}/tasks/${taskId}/time-entries/${entryId}`);
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: executionKeys.tasks(projectId) });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Project Member mutation
// ─────────────────────────────────────────────────────────────────────────────

export interface AddMemberPayload {
	userId: number;
	role: string;
}

interface AddMemberVars {
	projectId: number;
	payload: AddMemberPayload;
}

export function useAddProjectMember() {
	const queryClient = useQueryClient();

	return useMutation<ProjectMemberResource, Error, AddMemberVars>({
		mutationFn: async ({ projectId, payload }) => {
			const response = await api.post<ApiEnvelope<ProjectMemberResource>>(`/projects/${projectId}/members`, payload);
			return response.data.data;
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Remove Project Member mutation
// ─────────────────────────────────────────────────────────────────────────────

interface RemoveMemberVars {
	projectId: number;
	memberId: number;
}

export function useRemoveProjectMember() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, RemoveMemberVars>({
		mutationFn: async ({ projectId, memberId }) => {
			await api.delete(`/projects/${projectId}/members/${memberId}`);
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Project Files hooks
// ─────────────────────────────────────────────────────────────────────────────

import type { ProjectFile } from "@/entities/project/model/types";

export const fileKeys = {
	files: (projectId: number) => [...projectKeys.detail(projectId), "files"] as const,
};

interface ProjectFileListData {
	files: ProjectFile[];
}

export function useProjectFiles(projectId: number) {
	return useQuery({
		queryKey: fileKeys.files(projectId),
		queryFn: async () => {
			const response = await api.get<ApiEnvelope<ProjectFileListData>>(`/projects/${projectId}/files`);
			return response.data.data.files;
		},
		enabled: Number.isFinite(projectId) && projectId > 0,
		staleTime: 2 * 60 * 1000,
	});
}

export function useUploadProjectFile() {
	const queryClient = useQueryClient();

	return useMutation<ProjectFile, Error, { projectId: number; formData: FormData }>({
		mutationFn: async ({ projectId, formData }) => {
			const response = await api.post<ApiEnvelope<ProjectFile>>(`/projects/${projectId}/files`, formData, { headers: { "Content-Type": "multipart/form-data" } });
			return response.data.data;
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: fileKeys.files(projectId) });
		},
	});
}

export function useDeleteProjectFile() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, { projectId: number; fileId: number }>({
		mutationFn: async ({ projectId, fileId }) => {
			await api.delete(`/projects/${projectId}/files/${fileId}`);
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: fileKeys.files(projectId) });
		},
	});
}
