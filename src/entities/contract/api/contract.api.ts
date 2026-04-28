import api from "@/shared/api/base";
import type {
	Contract,
	ContractListResponse,
	ContractMilestone,
	ContractFilters,
	CreateContractPayload,
	UpdateContractPayload,
	SignContractPayload,
} from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

function buildContractParams(filters?: ContractFilters) {
	const params = new URLSearchParams();
	if (filters?.search) params.append("filter[search]", filters.search);
	if (filters?.status) params.append("filter[status]", filters.status);
	if (filters?.projectId) params.append("filter[projectId]", String(filters.projectId));
	if (filters?.quotationId) params.append("filter[quotationId]", String(filters.quotationId));
	if (filters?.leadId) params.append("filter[leadId]", String(filters.leadId));
	if (filters?.page) params.append("page", String(filters.page));
	if (filters?.perPage) params.append("perPage", String(filters.perPage));
	return params;
}

export const contractApi = {
	async getContracts(filters?: ContractFilters): Promise<ContractListResponse> {
		const params = buildContractParams(filters);
		const query = params.toString();
		const response = await api.get<ApiEnvelope<ContractListResponse>>(query ? `/contracts?${query}` : "/contracts");
		return response.data.data;
	},

	async getContractById(id: number): Promise<Contract> {
		const response = await api.get<ApiEnvelope<Contract>>(`/contracts/${id}`);
		return response.data.data;
	},

	async createContract(payload: CreateContractPayload): Promise<Contract> {
		const response = await api.post<ApiEnvelope<Contract>>("/contracts", payload);
		return response.data.data;
	},

	async createContractFromQuotation(quotationId: number, payload: CreateContractPayload): Promise<Contract> {
		const response = await api.post<ApiEnvelope<Contract>>(`/contracts/from-quotation/${quotationId}`, payload);
		return response.data.data;
	},

	async updateContract(id: number, payload: UpdateContractPayload): Promise<Contract> {
		const response = await api.put<ApiEnvelope<Contract>>(`/contracts/${id}`, payload);
		return response.data.data;
	},

	async signContract(id: number, payload: SignContractPayload): Promise<Contract> {
		const requestPayload =
			payload.signedPdf !== undefined
				? (() => {
						const formData = new FormData();
						formData.append("signedByClient", payload.signedByClient);
						formData.append("signedPdf", payload.signedPdf);
						return formData;
					})()
				: { signedByClient: payload.signedByClient };

		const response = await api.patch<ApiEnvelope<Contract>>(`/contracts/${id}/sign`, requestPayload);
		return response.data.data;
	},

	async activateContract(id: number): Promise<Contract> {
		const response = await api.post<ApiEnvelope<Contract>>(`/contracts/${id}/activate`);
		return response.data.data;
	},

	async updateContractStatus(id: number, status: string): Promise<Contract> {
		const response = await api.patch<ApiEnvelope<Contract>>(`/contracts/${id}/status`, { status });
		return response.data.data;
	},

	async deleteContract(id: number): Promise<void> {
		await api.delete(`/contracts/${id}`);
	},

	async getDueMilestones(): Promise<{ milestones: ContractMilestone[] }> {
		const response = await api.get<ApiEnvelope<{ milestones: ContractMilestone[] }>>("/contracts/milestones/due");
		return response.data.data;
	},

	async markMilestonePaid(milestoneId: number, invoiceId?: number): Promise<ContractMilestone> {
		const response = await api.patch<ApiEnvelope<ContractMilestone>>(`/contracts/milestones/${milestoneId}/paid`, { invoiceId });
		return response.data.data;
	},
};
