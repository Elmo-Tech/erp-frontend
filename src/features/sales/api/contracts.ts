import api from "@/lib/axios";
import { Contract, ContractMilestone, ContractListResponse, CreateContractPayload, UpdateContractPayload, SignContractPayload, ContractFilters } from "../types";

export const contractsApi = {
	getAll: async (filters?: ContractFilters): Promise<ContractListResponse> => {
		const params = new URLSearchParams();

		if (filters?.search) params.append("filter[search]", filters.search);
		if (filters?.status) params.append("filter[status]", filters.status);
		if (filters?.projectId) params.append("filter[projectId]", filters.projectId.toString());
		if (filters?.quotationId) params.append("filter[quotationId]", filters.quotationId.toString());
		if (filters?.page) params.append("page", filters.page.toString());
		if (filters?.perPage) params.append("perPage", filters.perPage.toString());

		const response = await api.get<{ data: ContractListResponse }>(`/contracts?${params.toString()}`);
		return response.data.data;
	},

	getById: async (id: number): Promise<Contract> => {
		const response = await api.get<{ data: Contract }>(`/contracts/${id}`);
		return response.data.data;
	},

	create: async (payload: CreateContractPayload): Promise<Contract> => {
		const response = await api.post<{ data: Contract }>("/contracts", payload);
		return response.data.data;
	},

	createFromQuotation: async (quotationId: number, payload: CreateContractPayload): Promise<Contract> => {
		const response = await api.post<{ data: Contract }>(`/contracts/from-quotation/${quotationId}`, payload);
		return response.data.data;
	},

	update: async (id: number, payload: UpdateContractPayload): Promise<Contract> => {
		const response = await api.put<{ data: Contract }>(`/contracts/${id}`, payload);
		return response.data.data;
	},

	sign: async (id: number, payload: SignContractPayload): Promise<Contract> => {
		const response = await api.post<{ data: Contract }>(`/contracts/${id}/sign`, payload);
		return response.data.data;
	},

	activate: async (id: number): Promise<Contract> => {
		const response = await api.post<{ data: Contract }>(`/contracts/${id}/activate`);
		return response.data.data;
	},

	updateStatus: async (id: number, status: string): Promise<Contract> => {
		const response = await api.patch<{ data: Contract }>(`/contracts/${id}/status`, { status });
		return response.data.data;
	},

	delete: async (id: number): Promise<void> => {
		await api.delete(`/contracts/${id}`);
	},

	// Milestones
	getDueMilestones: async (): Promise<{ milestones: ContractMilestone[] }> => {
		const response = await api.get<{ data: { milestones: ContractMilestone[] } }>("/contracts/milestones/due");
		return response.data.data;
	},

	markMilestonePaid: async (milestoneId: number, invoiceId?: number): Promise<ContractMilestone> => {
		const response = await api.patch<{ data: ContractMilestone }>(`/contracts/milestones/${milestoneId}/paid`, {
			invoiceId,
		});
		return response.data.data;
	},
};
