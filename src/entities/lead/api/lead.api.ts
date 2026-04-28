import api from "@/shared/api/base";
import type {
	Lead,
	LeadListResponse,
	LeadKanbanResponse,
	LeadFilters,
	CreateLeadPayload,
	UpdateLeadPayload,
	CanConvertResponse,
	ConvertLeadPayload,
} from "../model/types";
import type { Client } from "@/entities/client/model/types";

interface ApiEnvelope<T> {
	data: T;
}

function buildLeadParams(filters?: LeadFilters) {
	const params = new URLSearchParams();
	if (filters?.search) params.append("filter[search]", filters.search);
	if (filters?.status) params.append("filter[status]", filters.status);
	if (filters?.source) params.append("filter[source]", filters.source);
	if (filters?.priority) params.append("filter[priority]", filters.priority);
	if (filters?.assignedTo) params.append("filter[assignedTo]", String(filters.assignedTo));
	if (filters?.page) params.append("page", String(filters.page));
	if (filters?.perPage) params.append("perPage", String(filters.perPage));
	return params;
}

export const leadApi = {
	async getLeads(filters?: LeadFilters): Promise<LeadListResponse> {
		const params = buildLeadParams(filters);
		const query = params.toString();
		const response = await api.get<ApiEnvelope<LeadListResponse>>(query ? `/leads?${query}` : "/leads");
		return response.data.data;
	},

	async getLeadById(id: number): Promise<Lead> {
		const response = await api.get<ApiEnvelope<Lead>>(`/leads/${id}`);
		return response.data.data;
	},

	async getLeadsKanban(): Promise<LeadKanbanResponse> {
		const response = await api.get<ApiEnvelope<LeadKanbanResponse>>("/leads-kanban");
		return response.data.data;
	},

	async getFollowUps(): Promise<Lead[]> {
		const response = await api.get<ApiEnvelope<{ leads: Lead[] }>>("/leads-follow-ups");
		return response.data.data.leads;
	},

	async createLead(payload: CreateLeadPayload): Promise<Lead> {
		const response = await api.post<ApiEnvelope<Lead>>("/leads", payload);
		return response.data.data;
	},

	async updateLead(id: number, payload: UpdateLeadPayload): Promise<Lead> {
		const response = await api.put<ApiEnvelope<Lead>>(`/leads/${id}`, payload);
		return response.data.data;
	},

	async updateLeadStatus(id: number, status: Lead["status"]): Promise<Lead> {
		const response = await api.patch<ApiEnvelope<Lead>>(`/leads/${id}/status`, { status });
		return response.data.data;
	},

	async deleteLead(id: number): Promise<void> {
		await api.delete(`/leads/${id}`);
	},

	async canConvertLead(leadId: number): Promise<CanConvertResponse> {
		const response = await api.get<ApiEnvelope<CanConvertResponse>>(`/leads/${leadId}/can-convert`);
		return response.data.data;
	},

	async convertLead(leadId: number, payload?: ConvertLeadPayload): Promise<{ success: boolean; message: string; data: Client }> {
		const response = await api.post(`/leads/${leadId}/convert`, payload || {});
		return response.data;
	},
};
