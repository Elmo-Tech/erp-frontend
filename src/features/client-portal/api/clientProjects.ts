/**
 * Client Portal Projects API
 * API functions for client project management with Black Box principle.
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

import api from "@/lib/axios";
import { ClientProject, ClientProjectListResponse, ClientProjectFilters } from "../types/clientProject";

/**
 * API functions for client project operations
 * All endpoints automatically apply ClientScope for data isolation
 */
export const clientProjectsApi = {
	/**
	 * Get all client projects with optional filtering and pagination
	 * Requirement 9.1: GET /api/v1/client/projects endpoint to list client's projects with pagination
	 * Requirement 9.3: Use ClientProjectResource for all client project responses
	 * Requirement 9.4: Automatically apply ClientScope to filter projects
	 */
	getAll: async (filters?: ClientProjectFilters): Promise<ClientProjectListResponse> => {
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

		const queryString = params.toString();
		const url = queryString ? `/client/projects?${queryString}` : "/client/projects";

		const response = await api.get<{ data: ClientProjectListResponse }>(url);
		return response.data.data;
	},

	/**
	 * Get a single client project by ID
	 * Requirement 9.2: GET /api/v1/client/projects/{id} endpoint to retrieve a single project with progress
	 * Requirement 9.3: Use ClientProjectResource for all client project responses
	 */
	getById: async (id: number): Promise<ClientProject> => {
		const response = await api.get<{ data: ClientProject }>(`/client/projects/${id}`);
		return response.data.data;
	},

};
