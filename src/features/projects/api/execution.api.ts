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

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import api from "@/shared/api/base";
import { projectKeys } from "@/entities/project/model/query-keys";
import { hrKeys } from "@/entities/hr/model/query-keys";
import type { ProjectFile } from "@/entities/project/model/types";
import type { TaskPriority } from "@/shared/lib/statusHelpers";
import {
	mapChangeRequestListData,
	mapChangeRequestResource,
	type ChangeRequest,
	type ChangeRequestListData,
	type ChangeRequestStatusValue,
	type CreateChangeRequestPayload,
	type RawChangeRequestResource,
} from "../model/project-change-request-contract";
import {
	mapProjectFileListData,
	mapProjectFileResource,
	type ProjectFileListData,
	type RawProjectFileResource,
} from "../model/project-file-contract";
import {
	mapTaskDeliverableResource,
	type RawTaskDeliverableResource,
	type TaskDeliverable,
} from "../model/project-deliverable-contract";
import {
	mapProjectMemberListData,
	mapProjectMemberResource,
	type AddMemberPayload,
	type ProjectMemberListData,
	type ProjectMemberResource,
	type RawProjectMemberResource,
} from "../model/project-member-contract";
import {
	buildProjectTaskQuery,
	ExecutionTaskStatus,
	ExecutionTaskStatusLabels,
	mapProjectTaskListData,
	mapProjectTaskResource,
	type ExecutionTaskStatusValue,
	type Milestone,
	type ProjectTask,
	type ProjectTaskFilters,
	type ProjectWorkflow,
	type ProjectWorkflowStage,
	type RawProjectTaskResource,
	type TaskListData,
	type WorkflowTemplate,
} from "../model/project-task-contract";
import {
	buildProjectTimelineQuery,
	mapProjectTimelineResponse,
	type ProjectTimelineFilters,
	type ProjectTimelineResponse,
	type RawProjectTimelineResponse,
} from "../model/project-timeline-contract";
import {
	mapNullableProjectTimeEntryResource,
	mapProjectTimeEntryResource,
	type LogManualTimePayload,
	type ProjectTimeEntry,
	type RawProjectTimeEntryResource,
} from "../model/project-time-entry-contract";
import { mapProjectHistoryListData, type ProjectHistoryListData } from "../model/project-history-contract";

export { CHANGE_REQUEST_STATUSES, mapChangeRequestListData, mapChangeRequestResource } from "../model/project-change-request-contract";
export type {
	ChangeRequest,
	ChangeRequestListData,
	ChangeRequestStatusValue,
	CreateChangeRequestPayload,
	RawChangeRequestResource,
} from "../model/project-change-request-contract";
export { mapProjectFileListData, mapProjectFileResource } from "../model/project-file-contract";
export type { ProjectFileListData, RawProjectFileResource } from "../model/project-file-contract";
export { mapTaskDeliverableList, mapTaskDeliverableResource } from "../model/project-deliverable-contract";
export type { RawTaskDeliverableResource, TaskDeliverable } from "../model/project-deliverable-contract";
export { mapProjectMemberListData, mapProjectMemberResource } from "../model/project-member-contract";
export type { AddMemberPayload, ProjectMemberListData, ProjectMemberResource, RawProjectMemberResource } from "../model/project-member-contract";
export {
	EXECUTION_TASK_STATUS_OPTIONS,
	ExecutionTaskStatus,
	ExecutionTaskStatusColors,
	ExecutionTaskStatusLabels,
	mapProjectTaskListData,
	mapProjectTaskResource,
} from "../model/project-task-contract";
export type {
	ExecutionTaskStatusValue,
	Milestone,
	ProjectTask,
	ProjectTaskFilters,
	RawProjectTaskResource,
	ProjectWorkflow,
	ProjectWorkflowStage,
	TaskAllowedActions,
	TaskAssignee,
	TaskListData,
	WorkflowTemplate,
} from "../model/project-task-contract";
export { buildProjectTimelineQuery, mapProjectTimelineResponse } from "../model/project-timeline-contract";
export type {
	ProjectTimelineConflict,
	ProjectTimelineFilters,
	ProjectTimelineItem,
	ProjectTimelineResponse,
	ProjectTimelineSuggestion,
	ProjectTimelineUser,
	RawProjectTimelineConflict,
	RawProjectTimelineItem,
	RawProjectTimelineResponse,
	RawProjectTimelineSuggestion,
	RawProjectTimelineUser,
} from "../model/project-timeline-contract";
export { mapNullableProjectTimeEntryResource, mapProjectTimeEntryList, mapProjectTimeEntryResource } from "../model/project-time-entry-contract";
export type { LogManualTimePayload, ProjectTimeEntry, ProjectTimeEntryUser, RawProjectTimeEntryResource } from "../model/project-time-entry-contract";
export { mapProjectHistoryEntry, mapProjectHistoryListData } from "../model/project-history-contract";
export type { ProjectHistoryChangedByUser, ProjectHistoryEntry, ProjectHistoryListData, RawProjectHistoryEntry } from "../model/project-history-contract";

// ─────────────────────────────────────────────────────────────────────────────
// API envelope
// ─────────────────────────────────────────────────────────────────────────────

interface ApiEnvelope<T> {
	data: T;
	success: boolean;
	message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Query key extensions for execution sub-resources
// ─────────────────────────────────────────────────────────────────────────────

export const executionKeys = {
	milestones: (projectId: number) => [...projectKeys.detail(projectId), "milestones"] as const,
	taskLists: (projectId: number) => [...projectKeys.detail(projectId), "tasks"] as const,
	tasks: (projectId: number, filters?: ProjectTaskFilters) => [...projectKeys.detail(projectId), "tasks", filters] as const,
	changeRequests: (projectId: number) => [...projectKeys.detail(projectId), "change-requests"] as const,
	activeTimeEntry: () => ["project-execution", "time-entries", "active"] as const,
	myActiveTasks: () => ["project-execution", "tasks", "my-active"] as const,
	taskControl: () => ["project-execution", "tasks", "control"] as const,
	timeline: (filters: ProjectTimelineFilters) => ["project-execution", "timeline", filters] as const,
	workflow: (projectId: number) => [...projectKeys.detail(projectId), "workflow"] as const,
	workflowTemplates: () => ["project-execution", "workflow-templates"] as const,
};

function invalidateProjectTaskLists(queryClient: QueryClient, projectId: number) {
	queryClient.invalidateQueries({ queryKey: executionKeys.taskLists(projectId) });
}

function updateCachedProjectTask(queryClient: QueryClient, projectId: number, taskId: number, updater: (task: ProjectTask) => ProjectTask) {
	queryClient.setQueriesData<ProjectTask[]>({ queryKey: executionKeys.taskLists(projectId) }, (tasks) => {
		if (!tasks) return tasks;
		return tasks.map((task) => (task.taskId === taskId ? updater(task) : task));
	});

	queryClient.setQueryData<ProjectTask[]>(executionKeys.myActiveTasks(), (tasks) => {
		if (!tasks) return tasks;
		return tasks.map((task) => (task.taskId === taskId ? updater(task) : task));
	});
}

function replaceCachedProjectTask(queryClient: QueryClient, task: ProjectTask) {
	updateCachedProjectTask(queryClient, task.projectId, task.taskId, (current) => ({
		...current,
		...task,
	}));
}

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

export function useProjectTasks(projectId: number, filters?: ProjectTaskFilters) {
	return useQuery({
		queryKey: executionKeys.tasks(projectId, filters),
		queryFn: () => getProjectTasks(projectId, filters),
		enabled: Number.isFinite(projectId) && projectId > 0,
		staleTime: 60 * 1000,
	});
}

export async function getProjectTasks(projectId: number, filters?: ProjectTaskFilters): Promise<ProjectTask[]> {
	const query = buildProjectTaskQuery(filters);
	const url = query ? `/projects/${projectId}/tasks?${query}` : `/projects/${projectId}/tasks`;
	const response = await api.get<ApiEnvelope<TaskListData>>(url);

	return mapProjectTaskListData(response.data.data);
}

export function useProjectWorkflow(projectId: number) {
	return useQuery({
		queryKey: executionKeys.workflow(projectId),
		queryFn: async () => {
			const response = await api.get<ApiEnvelope<ProjectWorkflow>>(`/projects/${projectId}/workflow`);
			return response.data.data;
		},
		enabled: Number.isFinite(projectId) && projectId > 0,
		staleTime: 60 * 1000,
	});
}

export function useWorkflowTemplates(enabled = true) {
	return useQuery({
		queryKey: executionKeys.workflowTemplates(),
		queryFn: async () => {
			const response = await api.get<ApiEnvelope<{ templates: WorkflowTemplate[] }>>("/projects/workflow-templates");
			return response.data.data.templates;
		},
		enabled,
		staleTime: 5 * 60 * 1000,
	});
}

export interface WorkflowStagePayload {
	id?: number;
	name: string;
	status: ExecutionTaskStatusValue;
	color: string;
	isTerminal: boolean;
}

export function useUpdateProjectWorkflow() {
	const queryClient = useQueryClient();

	return useMutation<ProjectWorkflowStage[], Error, { projectId: number; stages: WorkflowStagePayload[] }>({
		mutationFn: async ({ projectId, stages }) => {
			const response = await api.put<ApiEnvelope<{ stages: ProjectWorkflowStage[] }>>(`/projects/${projectId}/workflow`, { stages });
			return response.data.data.stages;
		},
		onSuccess: (_stages, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: executionKeys.workflow(projectId) });
			invalidateProjectTaskLists(queryClient, projectId);
		},
	});
}

export function useApplyWorkflowTemplate() {
	const queryClient = useQueryClient();

	return useMutation<ProjectWorkflowStage[], Error, { projectId: number; templateId: number }>({
		mutationFn: async ({ projectId, templateId }) => {
			const response = await api.post<ApiEnvelope<{ stages: ProjectWorkflowStage[] }>>(`/projects/${projectId}/workflow/apply-template`, { templateId });
			return response.data.data.stages;
		},
		onSuccess: (_stages, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: executionKeys.workflow(projectId) });
			invalidateProjectTaskLists(queryClient, projectId);
		},
	});
}

export function useCreateWorkflowTemplate() {
	const queryClient = useQueryClient();

	return useMutation<WorkflowTemplate, Error, { name: string; stages: WorkflowStagePayload[] }>({
		mutationFn: async ({ name, stages }) => {
			const response = await api.post<ApiEnvelope<WorkflowTemplate>>("/projects/workflow-templates", {
				name,
				stages,
			});
			return response.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: executionKeys.workflowTemplates() });
		},
	});
}

export function useMoveProjectTask() {
	const queryClient = useQueryClient();

	return useMutation<ProjectTask, Error, { projectId: number; taskId: number; workflowStageId: number; position: number }>({
		mutationFn: async ({ projectId, taskId, workflowStageId, position }) => {
			const response = await api.patch<ApiEnvelope<RawProjectTaskResource>>(`/projects/${projectId}/tasks/${taskId}/move`, {
				workflowStageId,
				position,
			});
			return mapProjectTaskResource(response.data.data);
		},
		onSuccess: (task, { projectId }) => {
			replaceCachedProjectTask(queryClient, task);
			invalidateProjectTaskLists(queryClient, projectId);
			queryClient.invalidateQueries({ queryKey: executionKeys.workflow(projectId) });
			queryClient.invalidateQueries({ queryKey: executionKeys.activeTimeEntry() });
		},
	});
}

export async function getMyActiveProjectTasks(): Promise<ProjectTask[]> {
	const response = await api.get<ApiEnvelope<TaskListData>>("/projects/tasks/my-active");
	return mapProjectTaskListData(response.data.data);
}

export function useMyActiveProjectTasks() {
	return useQuery({
		queryKey: executionKeys.myActiveTasks(),
		queryFn: getMyActiveProjectTasks,
		staleTime: 60 * 1000,
		refetchInterval: 60 * 1000,
	});
}

export async function getTaskControlTasks(): Promise<ProjectTask[]> {
	const response = await api.get<ApiEnvelope<TaskListData>>("/projects/tasks/control");
	return mapProjectTaskListData(response.data.data);
}

export function useTaskControlTasks() {
	return useQuery({
		queryKey: executionKeys.taskControl(),
		queryFn: getTaskControlTasks,
		staleTime: 2 * 60 * 1000,
	});
}

export async function getProjectTimeline(filters: ProjectTimelineFilters): Promise<ProjectTimelineResponse> {
	const query = buildProjectTimelineQuery(filters);
	const response = await api.get<ApiEnvelope<RawProjectTimelineResponse>>(`/projects/timeline?${query}`);
	return mapProjectTimelineResponse(response.data.data);
}

export function useProjectTimeline(filters: ProjectTimelineFilters) {
	return useQuery({
		queryKey: executionKeys.timeline(filters),
		queryFn: () => getProjectTimeline(filters),
		enabled: Boolean(filters.startDate && filters.endDate),
		staleTime: 60 * 1000,
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Timer toggle hook — fixed invalidation
// ─────────────────────────────────────────────────────────────────────────────

interface ToggleTimerVars {
	projectId: number;
	taskId: number;
}

export async function getActiveProjectTimeEntry(): Promise<ProjectTimeEntry | null> {
	const response = await api.get<ApiEnvelope<RawProjectTimeEntryResource | null>>("/projects/time-entries/active");
	return mapNullableProjectTimeEntryResource(response.data.data);
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
			const response = await api.post<ApiEnvelope<RawProjectTimeEntryResource>>(`/projects/${projectId}/tasks/${taskId}/time-entries/toggle`);
			return mapProjectTimeEntryResource(response.data.data);
		},
		onSuccess: (entry, { projectId, taskId }) => {
			if (entry.isRunning) {
				updateCachedProjectTask(queryClient, projectId, taskId, (task) =>
					task.status === ExecutionTaskStatus.TO_DO || task.status === ExecutionTaskStatus.BACKLOG
						? {
								...task,
								status: ExecutionTaskStatus.IN_PROGRESS,
								statusLabel: ExecutionTaskStatusLabels[ExecutionTaskStatus.IN_PROGRESS],
							}
						: task,
				);
			}
			// Invalidate tasks (carries timeEntries + totalLoggedMinutes) and milestones (progress)
			invalidateProjectTaskLists(queryClient, projectId);
			queryClient.invalidateQueries({ queryKey: executionKeys.milestones(projectId) });
			queryClient.invalidateQueries({ queryKey: executionKeys.activeTimeEntry() });
			queryClient.invalidateQueries({ queryKey: executionKeys.myActiveTasks() });
			queryClient.invalidateQueries({ queryKey: ["personal-tasks"] });
			queryClient.invalidateQueries({ queryKey: hrKeys.attendance() });
			queryClient.invalidateQueries({ queryKey: hrKeys.teamPulse() });
		},
	});
}

export type TaskTimerLifecycleAction = "start" | "hold" | "resume" | "end";

export function useTaskTimerLifecycle() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, { projectId: number; taskId: number; action: TaskTimerLifecycleAction }>({
		mutationFn: async ({ projectId, taskId, action }) => {
			await api.post(`/projects/${projectId}/tasks/${taskId}/time-entries/lifecycle`, { action });
		},
		onSuccess: (_data, { projectId }) => {
			invalidateProjectTaskLists(queryClient, projectId);
			queryClient.invalidateQueries({ queryKey: executionKeys.workflow(projectId) });
			queryClient.invalidateQueries({ queryKey: executionKeys.activeTimeEntry() });
			queryClient.invalidateQueries({ queryKey: executionKeys.myActiveTasks() });
			queryClient.invalidateQueries({ queryKey: hrKeys.attendance() });
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
		onSuccess: (task, { projectId }) => {
			replaceCachedProjectTask(queryClient, task);
			// Refresh tasks and milestones — completion updates milestone progress
			invalidateProjectTaskLists(queryClient, projectId);
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
			const response = await api.patch<ApiEnvelope<RawTaskDeliverableResource>>(`/projects/${projectId}/tasks/${taskId}/deliverables/${deliverableId}/toggle`);
			return mapTaskDeliverableResource(response.data.data);
		},
		onSuccess: (_data, { projectId }) => {
			invalidateProjectTaskLists(queryClient, projectId);
			queryClient.invalidateQueries({ queryKey: executionKeys.milestones(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Change Request hooks
export async function getProjectChangeRequests(projectId: number): Promise<ChangeRequest[]> {
	const response = await api.get<ApiEnvelope<ChangeRequestListData>>(`/projects/${projectId}/change-requests`);
	return mapChangeRequestListData(response.data.data);
}

export function useChangeRequests(projectId: number) {
	return useQuery({
		queryKey: executionKeys.changeRequests(projectId),
		queryFn: () => getProjectChangeRequests(projectId),
		enabled: Number.isFinite(projectId) && projectId > 0,
		staleTime: 2 * 60 * 1000,
	});
}

interface CreateChangeRequestVars {
	projectId: number;
	payload: CreateChangeRequestPayload;
}

export function useCreateChangeRequest() {
	const queryClient = useQueryClient();

	return useMutation<ChangeRequest, Error, CreateChangeRequestVars>({
		mutationFn: async ({ projectId, payload }) => {
			const response = await api.post<ApiEnvelope<RawChangeRequestResource>>(`/projects/${projectId}/change-requests`, payload);
			return mapChangeRequestResource(response.data.data);
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
	status: ChangeRequestStatusValue;
}

export function useUpdateChangeRequestStatus() {
	const queryClient = useQueryClient();

	return useMutation<ChangeRequest, Error, UpdateChangeRequestStatusVars>({
		mutationFn: async ({ projectId, changeRequestId, status }) => {
			const response = await api.patch<ApiEnvelope<RawChangeRequestResource>>(`/projects/${projectId}/change-requests/${changeRequestId}`, { status });
			return mapChangeRequestResource(response.data.data);
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

export const historyKeys = {
	history: (projectId: number) => [...projectKeys.detail(projectId), "history"] as const,
};

export function useProjectHistory(projectId: number) {
	return useQuery({
		queryKey: historyKeys.history(projectId),
		queryFn: async () => {
			const response = await api.get<ApiEnvelope<ProjectHistoryListData>>(`/projects/${projectId}/history`);
			return mapProjectHistoryListData(response.data.data);
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
			const response = await api.get<ApiEnvelope<ProjectMemberListData>>(`/projects/${projectId}/members`);
			return mapProjectMemberListData(response.data.data);
		},
		enabled: Number.isFinite(projectId) && projectId > 0,
		staleTime: 5 * 60 * 1000,
	});
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
	priority?: TaskPriority;
	estimatedHours?: number | null;
	startDate?: string | null;
	dueDate?: string | null;
	assigneeId?: number | null;
	assigneeIds?: number[];
	workflowStageId?: number | null;
	coverImage?: File | null;
}

export type UpdateTaskPayload = Partial<Omit<CreateTaskPayload, "description" | "coverImage">> & {
	description?: string | null;
	status?: ExecutionTaskStatusValue;
	reason?: string | null;
};

interface CreateTaskVars {
	projectId: number;
	payload: CreateTaskPayload;
}

export function useCreateTask() {
	const queryClient = useQueryClient();

	return useMutation<ProjectTask, Error, CreateTaskVars>({
		mutationFn: async ({ projectId, payload }) => {
			const requestPayload = payload.coverImage ? buildCreateTaskFormData(payload) : payload;
			const response = await api.post<ApiEnvelope<RawProjectTaskResource>>(`/projects/${projectId}/tasks`, requestPayload);
			return mapProjectTaskResource(response.data.data);
		},
		onSuccess: (_data, { projectId }) => {
			invalidateProjectTaskLists(queryClient, projectId);
			queryClient.invalidateQueries({ queryKey: executionKeys.milestones(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
		},
	});
}

function buildCreateTaskFormData(payload: CreateTaskPayload): FormData {
	const formData = new FormData();
	formData.append("title", payload.title);
	if (payload.description) formData.append("description", payload.description);
	if (payload.priority) formData.append("priority", payload.priority);
	if (payload.estimatedHours != null) formData.append("estimatedHours", String(payload.estimatedHours));
	if (payload.startDate) formData.append("startDate", payload.startDate);
	if (payload.dueDate) formData.append("dueDate", payload.dueDate);
	if (payload.milestoneId) formData.append("milestoneId", String(payload.milestoneId));
	if (payload.workflowStageId) formData.append("workflowStageId", String(payload.workflowStageId));
	payload.assigneeIds?.forEach((id) => formData.append("assigneeIds[]", String(id)));
	if (payload.coverImage) formData.append("coverImage", payload.coverImage);

	return formData;
}

interface UpdateTaskVars {
	projectId: number;
	taskId: number;
	payload: UpdateTaskPayload;
}

export async function updateProjectTask(projectId: number, taskId: number, payload: UpdateTaskPayload): Promise<ProjectTask> {
	const response = await api.patch<ApiEnvelope<RawProjectTaskResource>>(`/projects/${projectId}/tasks/${taskId}`, payload);
	return mapProjectTaskResource(response.data.data);
}

export function useUpdateProjectTask() {
	const queryClient = useQueryClient();

	return useMutation<ProjectTask, Error, UpdateTaskVars>({
		mutationFn: ({ projectId, taskId, payload }) => updateProjectTask(projectId, taskId, payload),
		onSuccess: (task, { projectId }) => {
			replaceCachedProjectTask(queryClient, task);
			invalidateProjectTaskLists(queryClient, projectId);
			queryClient.invalidateQueries({ queryKey: executionKeys.milestones(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
			queryClient.invalidateQueries({ queryKey: executionKeys.myActiveTasks() });
			queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
		},
	});
}

interface DeleteTaskVars {
	projectId: number;
	taskId: number;
}

export async function deleteProjectTask(projectId: number, taskId: number): Promise<void> {
	await api.delete(`/projects/${projectId}/tasks/${taskId}`);
}

export function useDeleteProjectTask() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, DeleteTaskVars>({
		mutationFn: ({ projectId, taskId }) => deleteProjectTask(projectId, taskId),
		onSuccess: (_data, { projectId }) => {
			invalidateProjectTaskLists(queryClient, projectId);
			queryClient.invalidateQueries({ queryKey: executionKeys.milestones(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
			queryClient.invalidateQueries({ queryKey: executionKeys.myActiveTasks() });
		},
	});
}

export function useUploadTaskCover() {
	const queryClient = useQueryClient();

	return useMutation<ProjectTask, Error, { projectId: number; taskId: number; coverImage: File }>({
		mutationFn: async ({ projectId, taskId, coverImage }) => {
			const formData = new FormData();
			formData.append("coverImage", coverImage);
			const response = await api.post<ApiEnvelope<RawProjectTaskResource>>(`/projects/${projectId}/tasks/${taskId}/cover`, formData);
			return mapProjectTaskResource(response.data.data);
		},
		onSuccess: (task, { projectId }) => {
			replaceCachedProjectTask(queryClient, task);
			invalidateProjectTaskLists(queryClient, projectId);
		},
	});
}

export function useDeleteTaskCover() {
	const queryClient = useQueryClient();

	return useMutation<ProjectTask, Error, { projectId: number; taskId: number }>({
		mutationFn: async ({ projectId, taskId }) => {
			const response = await api.delete<ApiEnvelope<RawProjectTaskResource>>(`/projects/${projectId}/tasks/${taskId}/cover`);
			return mapProjectTaskResource(response.data.data);
		},
		onSuccess: (task, { projectId }) => {
			replaceCachedProjectTask(queryClient, task);
			invalidateProjectTaskLists(queryClient, projectId);
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
			const response = await api.post<ApiEnvelope<RawTaskDeliverableResource>>(`/projects/${projectId}/tasks/${taskId}/deliverables`, { title });
			return mapTaskDeliverableResource(response.data.data);
		},
		onSuccess: (_data, { projectId }) => {
			invalidateProjectTaskLists(queryClient, projectId);
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
			const response = await api.patch<ApiEnvelope<RawTaskDeliverableResource>>(`/projects/${projectId}/tasks/${taskId}/deliverables/${deliverableId}`, { title });
			return mapTaskDeliverableResource(response.data.data);
		},
		onSuccess: (_data, { projectId }) => {
			invalidateProjectTaskLists(queryClient, projectId);
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
			invalidateProjectTaskLists(queryClient, projectId);
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
		onSuccess: (task, { projectId }) => {
			replaceCachedProjectTask(queryClient, task);
			if (task.status === ExecutionTaskStatus.DONE) {
				queryClient.setQueryData<ProjectTask[]>(executionKeys.myActiveTasks(), (tasks) => tasks?.filter((item) => item.taskId !== task.taskId));
			}
			invalidateProjectTaskLists(queryClient, projectId);
			queryClient.invalidateQueries({ queryKey: executionKeys.milestones(projectId) });
		},
	});
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
			const response = await api.post<ApiEnvelope<RawProjectTimeEntryResource>>(`/projects/${projectId}/tasks/${taskId}/time-entries`, payload);
			return mapProjectTimeEntryResource(response.data.data);
		},
		onSuccess: (_data, { projectId }) => {
			invalidateProjectTaskLists(queryClient, projectId);
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
			const response = await api.patch<ApiEnvelope<RawProjectTimeEntryResource>>(`/projects/${projectId}/tasks/${taskId}/time-entries/${entryId}`, payload);
			return mapProjectTimeEntryResource(response.data.data);
		},
		onSuccess: (_data, { projectId }) => {
			invalidateProjectTaskLists(queryClient, projectId);
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
			invalidateProjectTaskLists(queryClient, projectId);
		},
	});
}

interface AddMemberVars {
	projectId: number;
	payload: AddMemberPayload;
}

export function useAddProjectMember() {
	const queryClient = useQueryClient();

	return useMutation<ProjectMemberResource, Error, AddMemberVars>({
		mutationFn: async ({ projectId, payload }) => {
			const response = await api.post<ApiEnvelope<RawProjectMemberResource>>(`/projects/${projectId}/members`, payload);
			return mapProjectMemberResource(response.data.data);
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
export const fileKeys = {
	files: (projectId: number) => [...projectKeys.detail(projectId), "files"] as const,
	salesDocuments: (projectId: number) => [...projectKeys.detail(projectId), "sales-documents"] as const,
};

export interface ProjectSalesDocument {
	documentId: string;
	projectId: number;
	name: string;
	category: "proposal" | "quotation" | "contract";
	status: string;
	fileUrl: string | null;
	createdAt: string;
}

interface ProjectSalesDocumentListData {
	documents: ProjectSalesDocument[];
}

export function useProjectSalesDocuments(projectId: number) {
	return useQuery({
		queryKey: fileKeys.salesDocuments(projectId),
		queryFn: async () => {
			const response = await api.get<ApiEnvelope<ProjectSalesDocumentListData>>(`/projects/${projectId}/sales-documents`);
			return response.data.data.documents;
		},
		enabled: Number.isFinite(projectId) && projectId > 0,
		staleTime: 2 * 60 * 1000,
	});
}

export interface ProjectWiki {
	wikiId: number;
	projectId: number;
	title: string;
	content: string;
	isEncrypted: boolean;
	createdAt: string;
	updatedAt: string;
	createdBy: number;
	updatedBy: number;
}

interface ProjectWikiListData {
	wikis: ProjectWiki[];
	pagination?: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}

export interface ProjectWikiPayload {
	title: string;
	content: string;
	isEncrypted?: boolean;
}

export const wikiKeys = {
	wikis: (projectId: number) => [...projectKeys.detail(projectId), "wikis"] as const,
};

export function useProjectWikis(projectId: number) {
	return useQuery({
		queryKey: wikiKeys.wikis(projectId),
		queryFn: async () => {
			const response = await api.get<ApiEnvelope<ProjectWikiListData>>(`/projects/${projectId}/wikis?perPage=100`);
			return response.data.data.wikis;
		},
		enabled: Number.isFinite(projectId) && projectId > 0,
		staleTime: 2 * 60 * 1000,
	});
}

export function useCreateProjectWiki() {
	const queryClient = useQueryClient();

	return useMutation<ProjectWiki, Error, { projectId: number; payload: ProjectWikiPayload }>({
		mutationFn: async ({ projectId, payload }) => {
			const response = await api.post<ApiEnvelope<ProjectWiki>>(`/projects/${projectId}/wikis`, payload);
			return response.data.data;
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: wikiKeys.wikis(projectId) });
		},
	});
}

export function useUpdateProjectWiki() {
	const queryClient = useQueryClient();

	return useMutation<ProjectWiki, Error, { projectId: number; wikiId: number; payload: ProjectWikiPayload }>({
		mutationFn: async ({ projectId, wikiId, payload }) => {
			const response = await api.patch<ApiEnvelope<ProjectWiki>>(`/projects/${projectId}/wikis/${wikiId}`, payload);
			return response.data.data;
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: wikiKeys.wikis(projectId) });
		},
	});
}

export function useDeleteProjectWiki() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, { projectId: number; wikiId: number }>({
		mutationFn: async ({ projectId, wikiId }) => {
			await api.delete(`/projects/${projectId}/wikis/${wikiId}`);
		},
		onSuccess: (_data, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: wikiKeys.wikis(projectId) });
		},
	});
}

export function useProjectFiles(projectId: number) {
	return useQuery({
		queryKey: fileKeys.files(projectId),
		queryFn: () => getProjectFiles(projectId),
		enabled: Number.isFinite(projectId) && projectId > 0,
		staleTime: 2 * 60 * 1000,
	});
}

export async function getProjectFiles(projectId: number): Promise<ProjectFile[]> {
	const response = await api.get<ApiEnvelope<ProjectFileListData>>(`/projects/${projectId}/files`);

	return mapProjectFileListData(response.data.data);
}

export function useUploadProjectFile() {
	const queryClient = useQueryClient();

	return useMutation<ProjectFile, Error, { projectId: number; formData: FormData }>({
		mutationFn: async ({ projectId, formData }) => {
			const response = await api.post<ApiEnvelope<RawProjectFileResource>>(`/projects/${projectId}/files`, formData, { headers: { "Content-Type": "multipart/form-data" } });
			return mapProjectFileResource(response.data.data);
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
