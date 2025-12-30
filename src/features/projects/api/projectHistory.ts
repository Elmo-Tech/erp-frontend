import api from "@/lib/axios";
import { ProjectHistoryListResponse, ProjectHistoryFilters } from "../types/projectHistory";

/**
 * API functions for project history management
 * Implements requirement 3.7: Project History API endpoint
 */
export const projectHistoryApi = {
	/**
	 * Get history for a project with optional field filter
	 * Requirement 3.7: GET /api/v1/projects/{id}/history endpoint to retrieve project change history
	 */
	getAll: async (projectId: number, fieldName?: string): Promise<ProjectHistoryListResponse> => {
		const params = new URLSearchParams();

		if (fieldName) {
			params.append("filter[fieldName]", fieldName);
		}

		const queryString = params.toString();
		const url = `/projects/${projectId}/history${queryString ? `?${queryString}` : ""}`;

		const response = await api.get<{ data: ProjectHistoryListResponse }>(url);
		return response.data.data;
	},
};
