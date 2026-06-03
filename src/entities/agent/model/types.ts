import type { ReportFilters, ReportKey } from "@/entities/reports/model/types";

export type AgentAction = "project.create_tasks" | "project.start_timer" | "reports.get";

export interface AgentCreateTasksPayload {
	projectId: number;
	tasks: Array<{
		title: string;
		description?: string | null;
		assigneeId?: number | null;
		dueDate?: string | null;
		milestoneId?: number | null;
		estimatedHours?: number | null;
		deliverables?: string[];
	}>;
}

export interface AgentStartTimerPayload {
	projectId: number;
	taskId: number;
}

export interface AgentReportPayload {
	report: ReportKey;
	filters?: ReportFilters;
}

export type AgentPayload = AgentCreateTasksPayload | AgentStartTimerPayload | AgentReportPayload;

export interface AgentActionRequest {
	action: AgentAction;
	payload: AgentPayload;
}

export interface AgentPreview {
	action: AgentAction;
	executable: boolean;
	project?: {
		projectId: number;
		title: string;
	};
	task?: {
		taskId: number;
		title: string;
		status?: string | null;
	};
	report?: ReportKey;
	filters?: ReportFilters;
	operations: Array<Record<string, unknown>>;
	requiredPermissions: string[];
}

export interface AgentPreviewResponse {
	logId: number;
	preview: AgentPreview;
}

export interface AgentParsedCommand {
	action: AgentAction | "unknown";
	payload: Partial<AgentPayload> | Record<string, never>;
	confidence: number;
	clarificationNeeded: boolean;
	clarificationQuestion: string | null;
}

export interface AgentParseResponse {
	logId: number;
	parsed: AgentParsedCommand;
	preview: AgentPreview | null;
}

export interface AgentExecuteResponse {
	logId: number;
	result: Record<string, unknown>;
}

export interface AgentActionLog {
	logId: number;
	action: AgentAction;
	status: string;
	payload: AgentPayload;
	preview?: AgentPreview | null;
	result?: Record<string, unknown> | null;
	error?: string | null;
	executedAt?: string | null;
	createdAt?: string | null;
}

export interface AgentLogsResponse {
	logs: AgentActionLog[];
}
