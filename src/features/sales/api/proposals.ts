import api from "@/lib/axios";
import { Proposal, ProposalListResponse, CreateProposalPayload, UpdateProposalPayload, FastTrackProposalPayload, RejectProposalPayload, ProposalFilters } from "../types";

export const proposalsApi = {
	getAll: async (filters?: ProposalFilters): Promise<ProposalListResponse> => {
		const params = new URLSearchParams();

		if (filters?.search) params.append("filter[search]", filters.search);
		if (filters?.status) params.append("filter[status]", filters.status);
		if (filters?.leadId) params.append("filter[leadId]", filters.leadId.toString());
		if (filters?.isFastTrack !== undefined) params.append("filter[isFastTrack]", filters.isFastTrack ? "1" : "0");
		if (filters?.page) params.append("page", filters.page.toString());
		if (filters?.perPage) params.append("perPage", filters.perPage.toString());

		const response = await api.get<{ data: ProposalListResponse }>(`/proposals?${params.toString()}`);
		return response.data.data;
	},

	getById: async (id: number): Promise<Proposal> => {
		const response = await api.get<{ data: Proposal }>(`/proposals/${id}`);
		return response.data.data;
	},

	getExpiring: async (days: number = 3): Promise<ProposalListResponse> => {
		const response = await api.get<{ data: ProposalListResponse }>(`/proposals-expiring?days=${days}`);
		return response.data.data;
	},

	create: async (payload: CreateProposalPayload): Promise<Proposal> => {
		const response = await api.post<{ data: Proposal }>("/proposals", payload);
		return response.data.data;
	},

	update: async (id: number, payload: UpdateProposalPayload): Promise<Proposal> => {
		const response = await api.put<{ data: Proposal }>(`/proposals/${id}`, payload);
		return response.data.data;
	},

	delete: async (id: number): Promise<void> => {
		await api.delete(`/proposals/${id}`);
	},

	uploadFile: async (id: number, file: File): Promise<Proposal> => {
		const formData = new FormData();
		formData.append("file", file);

		const response = await api.post<{ data: Proposal }>(`/proposals/${id}/upload`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data.data;
	},

	send: async (id: number): Promise<Proposal> => {
		const response = await api.post<{ data: Proposal }>(`/proposals/${id}/send`);
		return response.data.data;
	},

	approve: async (id: number): Promise<Proposal> => {
		const response = await api.post<{ data: Proposal }>(`/proposals/${id}/approve`);
		return response.data.data;
	},

	reject: async (id: number, payload: RejectProposalPayload): Promise<Proposal> => {
		const response = await api.post<{ data: Proposal }>(`/proposals/${id}/reject`, payload);
		return response.data.data;
	},

	createFastTrack: async (payload: FastTrackProposalPayload): Promise<Proposal> => {
		const response = await api.post<{ data: Proposal }>("/proposals/fast-track", payload);
		return response.data.data;
	},
};
