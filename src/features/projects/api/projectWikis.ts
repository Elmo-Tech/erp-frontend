import api from "@/lib/axios";
import { ProjectWiki, CreateProjectWikiPayload, UpdateProjectWikiPayload, ProjectWikiListResponse, ProjectWikiFilters } from "../types/projectWiki";

/**
 * API functions for project wiki management
 * Implements requirements 7.1-7.5: Project Wiki API endpoints
 */
export const projectWikisApi = {
	/**
	 * Get all wikis for a project
	 * Requirement 7.1: GET /api/v1/projects/{projectId}/wikis endpoint to list all wikis for a project
	 */
	getAll: async (projectId: number): Promise<ProjectWikiListResponse> => {
		const response = await api.get<{ data: ProjectWikiListResponse }>(`/projects/${projectId}/wikis`);
		return response.data.data;
	},

	/**
	 * Get a single wiki entry by ID
	 * Requirement 7.2: GET /api/v1/projects/{projectId}/wikis/{id} endpoint to retrieve a single wiki entry
	 */
	getById: async (projectId: number, wikiId: number): Promise<ProjectWiki> => {
		const response = await api.get<{ data: ProjectWiki }>(`/projects/${projectId}/wikis/${wikiId}`);
		return response.data.data;
	},

	/**
	 * Create a new wiki entry
	 * Requirement 7.3: POST /api/v1/projects/{projectId}/wikis endpoint to create a new wiki entry
	 */
	create: async (projectId: number, payload: CreateProjectWikiPayload): Promise<ProjectWiki> => {
		const response = await api.post<{ data: ProjectWiki }>(`/projects/${projectId}/wikis`, payload);
		return response.data.data;
	},

	/**
	 * Update an existing wiki entry
	 * Requirement 7.4: PUT /api/v1/projects/{projectId}/wikis/{id} endpoint to update a wiki entry
	 */
	update: async (projectId: number, wikiId: number, payload: UpdateProjectWikiPayload): Promise<ProjectWiki> => {
		const response = await api.put<{ data: ProjectWiki }>(`/projects/${projectId}/wikis/${wikiId}`, payload);
		return response.data.data;
	},

	/**
	 * Delete a wiki entry
	 * Requirement 7.5: DELETE /api/v1/projects/{projectId}/wikis/{id} endpoint to delete a wiki entry
	 */
	delete: async (projectId: number, wikiId: number): Promise<void> => {
		await api.delete(`/projects/${projectId}/wikis/${wikiId}`);
	},
};
