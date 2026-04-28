import api from "@/shared/api/base";
import type { ContractTemplate, CreateTemplatePayload, GenerateFromTemplatePayload, GeneratedTemplateContent, ProposalTemplate, UpdateTemplatePayload } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

function typeQuery(type?: string) {
	return type ? `?type=${encodeURIComponent(type)}` : "";
}

export const templateApi = {
	async getProposalTemplates(type?: string): Promise<ProposalTemplate[]> {
		const response = await api.get<ApiEnvelope<ProposalTemplate[]>>(`/templates/proposals${typeQuery(type)}`);

		return response.data.data;
	},

	async createProposalTemplate(payload: CreateTemplatePayload): Promise<ProposalTemplate> {
		const response = await api.post<ApiEnvelope<ProposalTemplate>>("/templates/proposals", payload);

		return response.data.data;
	},

	async updateProposalTemplate(id: number, payload: UpdateTemplatePayload): Promise<ProposalTemplate> {
		const response = await api.put<ApiEnvelope<ProposalTemplate>>(`/templates/proposals/${id}`, payload);

		return response.data.data;
	},

	async deleteProposalTemplate(id: number): Promise<void> {
		await api.delete(`/templates/proposals/${id}`);
	},

	async generateProposal(templateId: number, payload: GenerateFromTemplatePayload): Promise<GeneratedTemplateContent> {
		const response = await api.post<ApiEnvelope<GeneratedTemplateContent>>(`/templates/proposals/${templateId}/generate`, payload);

		return response.data.data;
	},

	async getContractTemplates(type?: string): Promise<ContractTemplate[]> {
		const response = await api.get<ApiEnvelope<ContractTemplate[]>>(`/templates/contracts${typeQuery(type)}`);

		return response.data.data;
	},

	async createContractTemplate(payload: CreateTemplatePayload): Promise<ContractTemplate> {
		const response = await api.post<ApiEnvelope<ContractTemplate>>("/templates/contracts", payload);

		return response.data.data;
	},

	async updateContractTemplate(id: number, payload: UpdateTemplatePayload): Promise<ContractTemplate> {
		const response = await api.put<ApiEnvelope<ContractTemplate>>(`/templates/contracts/${id}`, payload);

		return response.data.data;
	},

	async deleteContractTemplate(id: number): Promise<void> {
		await api.delete(`/templates/contracts/${id}`);
	},

	async generateContract(templateId: number, payload: GenerateFromTemplatePayload): Promise<GeneratedTemplateContent> {
		const response = await api.post<ApiEnvelope<GeneratedTemplateContent>>(`/templates/contracts/${templateId}/generate`, payload);

		return response.data.data;
	},
};

