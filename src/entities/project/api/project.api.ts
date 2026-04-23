import api from "@/shared/api/base";
import type { ConvertQuotationPayload, CreateDirectProjectPayload, CreateProjectPayload, Project, ProjectFilters, ProjectListResponse, ProjectMemberListResponse, UpdateProjectPayload } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

function buildProjectParams(filters?: ProjectFilters) {
	const params = new URLSearchParams();

	if (filters?.search) {
		params.append("filter[search]", filters.search);
	}

	if (filters?.status) {
		params.append("filter[status]", filters.status);
	}

	if (filters?.clientId) {
		params.append("filter[clientId]", String(filters.clientId));
	}

	if (filters?.page) {
		params.append("page", String(filters.page));
	}

	if (filters?.perPage) {
		params.append("perPage", String(filters.perPage));
	}

	return params;
}

export const projectApi = {
	async getProjects(filters?: ProjectFilters): Promise<ProjectListResponse> {
		const params = buildProjectParams(filters);
		const query = params.toString();
		const response = await api.get<ApiEnvelope<ProjectListResponse>>(query ? `/projects?${query}` : "/projects");

		return response.data.data;
	},

	async getProjectById(id: number): Promise<Project> {
		const response = await api.get<ApiEnvelope<Project>>(`/projects/${id}`);

		return response.data.data;
	},

	async getProjectMembers(id: number): Promise<ProjectMemberListResponse> {
		const response = await api.get<ApiEnvelope<ProjectMemberListResponse>>(`/projects/${id}/members`);

		return response.data.data;
	},

	async createProject(payload: CreateProjectPayload): Promise<Project> {
		const response = await api.post<ApiEnvelope<Project>>("/projects", payload);

		return response.data.data;
	},

	async createDirectProject(payload: CreateDirectProjectPayload): Promise<Project> {
		const response = await api.post<ApiEnvelope<Project>>("/projects/direct", payload);

		return response.data.data;
	},

	async updateProject(id: number, payload: UpdateProjectPayload): Promise<Project> {
		const response = await api.put<ApiEnvelope<Project>>(`/projects/${id}`, payload);

		return response.data.data;
	},

	async deleteProject(id: number): Promise<void> {
		await api.delete(`/projects/${id}`);
	},

	async convertQuotation(payload: ConvertQuotationPayload): Promise<Project> {
		const response = await api.post<ApiEnvelope<Project>>("/projects/convert", payload);

		return response.data.data;
	},

	async approveUI(id: number): Promise<Project> {
		const response = await api.post<ApiEnvelope<Project>>(`/projects/${id}/approve-ui`);

		return response.data.data;
	},

	async getPinnedProjects(): Promise<Project[]> {
		const response = await api.get<ApiEnvelope<Project[]>>("/projects/pinned");

		return response.data.data;
	},

	async pinProject(id: number): Promise<void> {
		await api.post(`/projects/${id}/pin`);
	},

	async unpinProject(id: number): Promise<void> {
		await api.delete(`/projects/${id}/pin`);
	},
};
