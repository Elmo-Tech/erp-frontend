import api from "@/shared/api/base";
import { Contract, ContractMilestone, ContractListResponse, CreateContractPayload, UpdateContractPayload, SignContractPayload, ContractFilters } from "../types";

export interface CreateMilestoneInvoicePayload {
	dueDate?: string;
	notes?: string;
	sendImmediately?: boolean;
}

export interface LinkMilestoneInvoicePayload {
	invoiceId: number;
}

export interface MilestoneWithInvoice extends ContractMilestone {
	invoice?: {
		invoiceId: number;
		invoiceNumber: string;
		amount: number;
		currency: string;
		status: string;
		dueDate: string;
		paidAt?: string;
	};
}

export const contractsApi = {
	getAll: async (filters?: ContractFilters): Promise<ContractListResponse> => {
		const params = new URLSearchParams();

		if (filters?.search) params.append("filter[search]", filters.search);
		if (filters?.status) params.append("filter[status]", filters.status);
		if (filters?.projectId) params.append("filter[projectId]", filters.projectId.toString());
		if (filters?.quotationId) params.append("filter[quotationId]", filters.quotationId.toString());
		if (filters?.leadId) params.append("filter[leadId]", filters.leadId.toString());
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
		const requestPayload =
			payload.signedPdf !== undefined
				? (() => {
						const formData = new FormData();
						formData.append("signedByClient", payload.signedByClient);
						formData.append("signedPdf", payload.signedPdf);
						return formData;
					})()
				: { signedByClient: payload.signedByClient };

		const response = await api.patch<{ data: Contract }>(`/contracts/${id}/sign`, requestPayload);
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

// Milestone API - separate endpoints for milestone-invoice integration
export const milestonesApi = {
	getById: async (milestoneId: number): Promise<MilestoneWithInvoice> => {
		const response = await api.get<{ data: MilestoneWithInvoice }>(`/milestones/${milestoneId}`);
		return response.data.data;
	},

	createInvoice: async (milestoneId: number, payload?: CreateMilestoneInvoicePayload): Promise<{ invoice: unknown; milestone: MilestoneWithInvoice }> => {
		const response = await api.post<{ data: { invoice: unknown; milestone: MilestoneWithInvoice } }>(`/milestones/${milestoneId}/create-invoice`, payload || {});
		return response.data.data;
	},

	linkInvoice: async (milestoneId: number, payload: LinkMilestoneInvoicePayload): Promise<{ milestone: MilestoneWithInvoice }> => {
		const response = await api.post<{ data: { milestone: MilestoneWithInvoice } }>(`/milestones/${milestoneId}/link-invoice`, payload);
		return response.data.data;
	},

	markPaid: async (milestoneId: number, invoiceId?: number): Promise<MilestoneWithInvoice> => {
		const response = await api.patch<{ data: MilestoneWithInvoice }>(`/milestones/${milestoneId}/mark-paid`, {
			invoiceId,
		});
		return response.data.data;
	},
};
