import api from "@/lib/axios";
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

// Supervision controls show action-specific feedback; heartbeats stay silent.
const callerFeedback = { skipErrorToast: true, skipSuccessToast: true };

export const taskSupervisionApi = {
	setSupervisor: async (taskId: number, payload: SetTaskSupervisorPayload): Promise<Task> => {
		const response = await api.put<{ data: Task }>(`/tasks/${taskId}/supervisor`, payload, callerFeedback);
		return response.data.data;
	},

	getTaskSupervision: async (taskId: number): Promise<TaskSupervision> => {
		const response = await api.get<{ data: TaskSupervision }>(`/tasks/${taskId}/supervision`);
		return response.data.data;
	},

	createHelpRequest: async (taskId: number, payload: CreateTaskHelpRequestPayload): Promise<TaskHelpRequest> => {
		const response = await api.post<{ data: TaskHelpRequest }>(`/tasks/${taskId}/help-requests`, payload, callerFeedback);
		return response.data.data;
	},

	updateHelpRequest: async (helpRequestId: number, payload: UpdateTaskHelpRequestPayload): Promise<TaskHelpRequest> => {
		const response = await api.patch<{ data: TaskHelpRequest }>(`/task-help-requests/${helpRequestId}`, payload, callerFeedback);
		return response.data.data;
	},

	startSession: async (taskId: number, payload: StartTaskSupervisionSessionPayload): Promise<TaskSupervisionSession> => {
		const response = await api.post<{ data: TaskSupervisionSession }>(`/tasks/${taskId}/supervision-sessions/start`, payload, callerFeedback);
		return response.data.data;
	},

	heartbeatSession: async (sessionId: number): Promise<TaskSupervisionSession> => {
		const response = await api.post<{ data: TaskSupervisionSession }>(`/task-supervision-sessions/${sessionId}/heartbeat`, undefined, callerFeedback);
		return response.data.data;
	},

	stopSession: async (sessionId: number, payload: StopTaskSupervisionSessionPayload): Promise<TaskSupervisionSession> => {
		const response = await api.post<{ data: TaskSupervisionSession }>(`/task-supervision-sessions/${sessionId}/stop`, payload, callerFeedback);
		return response.data.data;
	},

	getActiveSession: async (): Promise<TaskSupervisionSession | null> => {
		const response = await api.get<{ data: TaskSupervisionSession | null }>("/task-supervision-sessions/active");
		return response.data.data;
	},

	getSummary: async (filters?: TaskSupervisionSummaryFilters): Promise<TaskSupervisionSummaryResponse> => {
		const response = await api.get<{ data: TaskSupervisionSummaryResponse }>("/task-supervision/summary", { params: filters });
		return response.data.data;
	},
};
