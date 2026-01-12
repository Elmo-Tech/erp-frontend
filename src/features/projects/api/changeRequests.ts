/**
 * Change Requests API
 * API functions for project change request management
 */

import api from "@/lib/axios";
import { ChangeRequest, ChangeRequestListResponse, ChangeRequestSummary, CreateChangeRequestPayload, UpdateChangeRequestPayload } from "../types/changeRequest";

export const changeRequestsApi = {
	/**
	 * Get all change requests for a project
	 */
	getAll: async (projectId: number, page = 1, perPage = 15): Promise<ChangeRequestListResponse> => {
		const response = await api.get<{ data: ChangeRequestListResponse }>(`/projects/${projectId}/change-requests?page=${page}&perPage=${perPage}`);
		return response.data.data;
	},

	/**
	 * Get a single change request
	 */
	getById: async (id: number): Promise<ChangeRequest> => {
		const response = await api.get<{ data: ChangeRequest }>(`/change-requests/${id}`);
		return response.data.data;
	},

	/**
	 * Create a new change request
	 */
	create: async (projectId: number, payload: CreateChangeRequestPayload): Promise<ChangeRequest> => {
		const response = await api.post<{ data: ChangeRequest }>(`/projects/${projectId}/change-requests`, payload);
		return response.data.data;
	},

	/**
	 * Update a change request
	 */
	update: async (id: number, payload: UpdateChangeRequestPayload): Promise<ChangeRequest> => {
		const response = await api.put<{ data: ChangeRequest }>(`/change-requests/${id}`, payload);
		return response.data.data;
	},

	/**
	 * Submit change request for review
	 */
	submit: async (id: number): Promise<ChangeRequest> => {
		const response = await api.post<{ data: ChangeRequest }>(`/change-requests/${id}/submit`);
		return response.data.data;
	},

	/**
	 * Approve a change request
	 */
	approve: async (id: number, approvedCost?: number): Promise<ChangeRequest> => {
		const response = await api.post<{ data: ChangeRequest }>(`/change-requests/${id}/approve`, { approvedCost });
		return response.data.data;
	},

	/**
	 * Reject a change request
	 */
	reject: async (id: number, reason: string): Promise<ChangeRequest> => {
		const response = await api.post<{ data: ChangeRequest }>(`/change-requests/${id}/reject`, { reason });
		return response.data.data;
	},

	/**
	 * Mark change request as implemented
	 */
	implement: async (id: number): Promise<ChangeRequest> => {
		const response = await api.post<{ data: ChangeRequest }>(`/change-requests/${id}/implement`);
		return response.data.data;
	},

	/**
	 * Get CR summary for a project
	 */
	getSummary: async (projectId: number): Promise<ChangeRequestSummary> => {
		const response = await api.get<{ data: ChangeRequestSummary }>(`/projects/${projectId}/change-requests/summary`);
		return response.data.data;
	},
};
