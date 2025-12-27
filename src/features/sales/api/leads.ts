import api from "@/lib/axios";
import { Lead, CreateLeadPayload, UpdateLeadPayload, LeadListResponse, LeadFilters } from "../types/lead";

/**
 * API functions for lead management
 * Implements requirements 6.1-6.5: Lead API endpoints
 */
export const leadsApi = {
	/**
	 * Get all leads with optional filtering and pagination
	 * Requirement 6.1: GET /api/v1/leads endpoint to list all leads with pagination
	 * Requirement 6.6: Support filtering leads by status using query parameters
	 * Requirement 6.7: Support searching leads by name, email, or company
	 */
	getAll: async (filters?: LeadFilters): Promise<LeadListResponse> => {
		const params = new URLSearchParams();

		if (filters?.search) {
			params.append("filter[search]", filters.search);
		}
		if (filters?.status) {
			params.append("filter[status]", filters.status);
		}
		if (filters?.page) {
			params.append("page", filters.page.toString());
		}
		if (filters?.perPage) {
			params.append("perPage", filters.perPage.toString());
		}

		const response = await api.get<{ data: LeadListResponse }>(`/leads?${params.toString()}`);
		return response.data.data;
	},

	/**
	 * Get a single lead by ID
	 * Requirement 6.2: GET /api/v1/leads/{id} endpoint to retrieve a single lead
	 */
	getById: async (id: number): Promise<Lead> => {
		const response = await api.get<{ data: Lead }>(`/leads/${id}`);
		return response.data.data;
	},

	/**
	 * Create a new lead
	 * Requirement 6.3: POST /api/v1/leads endpoint to create a new lead
	 */
	create: async (payload: CreateLeadPayload): Promise<Lead> => {
		const response = await api.post<{ data: Lead }>("/leads", payload);
		return response.data.data;
	},

	/**
	 * Update an existing lead
	 * Requirement 6.4: PUT /api/v1/leads/{id} endpoint to update an existing lead
	 */
	update: async (id: number, payload: UpdateLeadPayload): Promise<Lead> => {
		const response = await api.put<{ data: Lead }>(`/leads/${id}`, payload);
		return response.data.data;
	},

	/**
	 * Delete a lead
	 * Requirement 6.5: DELETE /api/v1/leads/{id} endpoint to delete a lead
	 */
	delete: async (id: number): Promise<void> => {
		await api.delete(`/leads/${id}`);
	},
};
