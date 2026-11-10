/**
 * Task supervision types. These sessions are intentionally separate from work
 * time entries and do not contribute to task time spent.
 */

export type TaskHelpRequestStatus = "open" | "acknowledged" | "resolved" | "cancelled";

export interface TaskSupervisionUser {
	userId: number;
	name: string;
	email?: string;
	avatar?: string;
}

export interface TaskHelpRequest {
	helpRequestId: number;
	taskId: number;
	requesterId: number;
	message: string;
	status: TaskHelpRequestStatus;
	resolutionNote: string | null;
	acknowledgedAt: string | null;
	acknowledgedBy: TaskSupervisionUser | null;
	resolvedAt: string | null;
	resolvedBy: TaskSupervisionUser | null;
	requester: TaskSupervisionUser | null;
	createdAt: string;
	updatedAt: string;
}

export interface TaskSupervisionSession {
	sessionId: number;
	taskId: number;
	supervisorId: number;
	helpRequestId: number | null;
	startedAt: string;
	lastHeartbeatAt: string;
	endedAt: string | null;
	durationMinutes: number | null;
	isActive: boolean;
	notes?: string | null;
}

export interface TaskSupervisionSummary {
	taskId: number | null;
	totalHelpRequests: number;
	openHelpRequests: number;
	acknowledgedHelpRequests: number;
	resolvedHelpRequests: number;
	cancelledHelpRequests: number;
	totalSessions: number;
	activeSessions: number;
	totalDurationMinutes: number;
}

export interface TaskSupervisionSummaryResponse {
	summary: TaskSupervisionSummary;
}

export interface TaskSupervision {
	supervisors?: TaskSupervisionUser[];
	supervisor: TaskSupervisionUser | null;
	helpRequests: TaskHelpRequest[];
	sessions: TaskSupervisionSession[];
	summary: TaskSupervisionSummary;
}

export interface SetTaskSupervisorPayload {
	supervisorId?: number | null;
	supervisorIds?: number[];
}

export interface CreateTaskHelpRequestPayload {
	message: string;
}

export interface UpdateTaskHelpRequestPayload {
	status: Exclude<TaskHelpRequestStatus, "open">;
	resolutionNote?: string;
}

export interface StartTaskSupervisionSessionPayload {
	helpRequestId?: number;
	notes?: string;
}

export interface StopTaskSupervisionSessionPayload {
	stopReason?: string;
}

export interface TaskSupervisionSummaryFilters {
	taskId?: number;
	supervisorId?: number;
	requestedBy?: number;
	from?: string;
	to?: string;
}
