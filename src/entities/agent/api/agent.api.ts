import api from "@/shared/api/base";
import type { AgentActionRequest, AgentExecuteResponse, AgentLogsResponse, AgentParseResponse, AgentPreviewResponse } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

export const agentApi = {
	async parse(command: string): Promise<AgentParseResponse> {
		const response = await api.post<ApiEnvelope<AgentParseResponse>>("/agent/parse", { command });
		return response.data.data;
	},

	async preview(payload: AgentActionRequest): Promise<AgentPreviewResponse> {
		const response = await api.post<ApiEnvelope<AgentPreviewResponse>>("/agent/actions/preview", payload);
		return response.data.data;
	},

	async execute(payload: AgentActionRequest): Promise<AgentExecuteResponse> {
		const response = await api.post<ApiEnvelope<AgentExecuteResponse>>("/agent/actions/execute", payload);
		return response.data.data;
	},

	async logs(): Promise<AgentLogsResponse> {
		const response = await api.get<ApiEnvelope<AgentLogsResponse>>("/agent/actions/logs");
		return response.data.data;
	},
};
