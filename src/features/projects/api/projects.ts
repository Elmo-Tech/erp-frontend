import api from "@/lib/axios";
import { Project, CreateProjectPayload, CreateDirectProjectPayload, UpdateProjectPayload, ConvertQuotationPayload, ProjectListResponse, ProjectFilters } from "../types/project";

/**
 * API functions for project management
 * Implements requirements 6.1-6.5, 2.7, 5.7: Project API endpoints
 */
export const projectsApi = {
	/**
	 * Get all projects with optional filtering and pagination
	 * Requirement 6.1: GET /api/v1/projects endpoint to list all projects with pagination
	 * Requirement 6.6: Support filtering projects by status and client_id using query parameters
	 * Requirement 6.7: Support searching projects by title
	 */
	getAll: async (filters?: ProjectFilters): Promise<ProjectListResponse> => {
		const params = new URLSearchParams();

		if (filters?.search) {
			params.append("filter[search]", filters.search);
		}
		if (filters?.status) {
			params.append("filter[status]", filters.status);
		}
		if (filters?.clientId) {
			params.append("filter[clientId]", filters.clientId.toString());
		}
		if (filters?.projectTypeId) {
			params.append("filter[projectTypeId]", filters.projectTypeId.toString());
		}
		if (filters?.page) {
			params.append("page", filters.page.toString());
		}
		if (filters?.perPage) {
			params.append("perPage", filters.perPage.toString());
		}

		const response = await api.get<{ data: ProjectListResponse }>(`/projects?${params.toString()}`);
		return response.data.data;
	},

	/**
	 * Get a single project by ID with related data
	 * Requirement 6.2: GET /api/v1/projects/{id} endpoint to retrieve a single project with related data
	 */
	getById: async (id: number): Promise<Project> => {
		const response = await api.get<{ data: Project }>(`/projects/${id}`);
		return response.data.data;
	},

	/**
	 * Create a new project (direct creation)
	 * Requirement 6.3: POST /api/v1/projects endpoint to create a new project
	 */
	create: async (payload: CreateProjectPayload): Promise<Project> => {
		const response = await api.post<{ data: Project }>("/projects", payload);
		return response.data.data;
	},

	/**
	 * Create a new project directly for a client (without quotation)
	 */
	createDirect: async (payload: CreateDirectProjectPayload): Promise<Project> => {
		const response = await api.post<{ data: Project }>("/projects/direct", payload);
		return response.data.data;
	},

	/**
	 * Update an existing project with history tracking
	 * Requirement 6.4: PUT /api/v1/projects/{id} endpoint to update an existing project
	 */
	update: async (id: number, payload: UpdateProjectPayload): Promise<Project> => {
		const response = await api.put<{ data: Project }>(`/projects/${id}`, payload);
		return response.data.data;
	},

	/**
	 * Delete a project
	 * Requirement 6.5: DELETE /api/v1/projects/{id} endpoint to delete a project
	 */
	delete: async (id: number): Promise<void> => {
		await api.delete(`/projects/${id}`);
	},

	/**
	 * Convert quotation to project using ProjectConversionService
	 * Requirement 2.7: POST /api/v1/projects/convert endpoint to convert a quotation to a project
	 */
	convert: async (payload: ConvertQuotationPayload): Promise<Project> => {
		const response = await api.post<{ data: Project }>("/projects/convert", payload);
		return response.data.data;
	},

	/**
	 * Manually approve UI/UX phase
	 * Requirement 5.7: POST /api/v1/projects/{id}/approve-ui endpoint for manual UI approval
	 */
	approveUI: async (id: number): Promise<Project> => {
		const response = await api.post<{ data: Project }>(`/projects/${id}/approve-ui`);
		return response.data.data;
	},

	/**
	 * Get all pinned projects for the current user
	 */
	getPinned: async (): Promise<Project[]> => {
		const response = await api.get<{ data: Project[] }>("/projects/pinned");
		return response.data.data;
	},

	/**
	 * Pin a project
	 */
	pin: async (id: number): Promise<void> => {
		await api.post(`/projects/${id}/pin`);
	},

	/**
	 * Unpin a project
	 */
	unpin: async (id: number): Promise<void> => {
		await api.delete(`/projects/${id}/pin`);
	},
};
