import api from "@/lib/axios";
import { ProposalTemplate, ContractTemplate, CreateTemplatePayload, UpdateTemplatePayload, GenerateFromTemplatePayload } from "../types";

export const templatesApi = {
	// Proposal Templates
	getProposalTemplates: async (type?: string): Promise<ProposalTemplate[]> => {
		const params = type ? `?type=${type}` : "";
		const response = await api.get<{ data: ProposalTemplate[] }>(`/templates/proposals${params}`);
		return response.data.data;
	},

	createProposalTemplate: async (payload: CreateTemplatePayload): Promise<ProposalTemplate> => {
		const response = await api.post<{ data: ProposalTemplate }>("/templates/proposals", payload);
		return response.data.data;
	},

	updateProposalTemplate: async (id: number, payload: UpdateTemplatePayload): Promise<ProposalTemplate> => {
		const response = await api.put<{ data: ProposalTemplate }>(`/templates/proposals/${id}`, payload);
		return response.data.data;
	},

	deleteProposalTemplate: async (id: number): Promise<void> => {
		await api.delete(`/templates/proposals/${id}`);
	},

	generateProposal: async (templateId: number, payload: GenerateFromTemplatePayload): Promise<{ content: string }> => {
		const response = await api.post<{ data: { content: string } }>(`/templates/proposals/${templateId}/generate`, payload);
		return response.data.data;
	},

	// Contract Templates
	getContractTemplates: async (type?: string): Promise<ContractTemplate[]> => {
		const params = type ? `?type=${type}` : "";
		const response = await api.get<{ data: ContractTemplate[] }>(`/templates/contracts${params}`);
		return response.data.data;
	},

	createContractTemplate: async (payload: CreateTemplatePayload): Promise<ContractTemplate> => {
		const response = await api.post<{ data: ContractTemplate }>("/templates/contracts", payload);
		return response.data.data;
	},

	updateContractTemplate: async (id: number, payload: UpdateTemplatePayload): Promise<ContractTemplate> => {
		const response = await api.put<{ data: ContractTemplate }>(`/templates/contracts/${id}`, payload);
		return response.data.data;
	},

	deleteContractTemplate: async (id: number): Promise<void> => {
		await api.delete(`/templates/contracts/${id}`);
	},

	generateContract: async (templateId: number, payload: GenerateFromTemplatePayload): Promise<{ content: string }> => {
		const response = await api.post<{ data: { content: string } }>(`/templates/contracts/${templateId}/generate`, payload);
		return response.data.data;
	},
};
