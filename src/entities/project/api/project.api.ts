"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/shared/api/base";
import type { ClientProjectListResponse, ConvertQuotationPayload, CreateDirectProjectPayload, CreateProjectPayload, Project, ProjectFilters, ProjectListResponse, ProjectMemberListResponse, UpdateProjectPayload } from "../model/types";
import { projectKeys } from "../model/query-keys";

interface ApiEnvelope<T> {
	data: T;
}

export interface RawProjectResource extends Omit<Project, "currency" | "contract" | "createdByUser" | "quotation" | "tasks"> {
	autoApprovalJobId?: string | null;
}

export interface RawProjectListResponse {
	projects: RawProjectResource[];
	pagination: ProjectListResponse["pagination"];
}

export function mapProjectResource(resource: RawProjectResource): Project {
	return {
		projectId: resource.projectId,
		clientId: resource.clientId,
		quotationId: resource.quotationId,
		title: resource.title,
		description: resource.description,
		status: resource.status,
		previousStatus: resource.previousStatus,
		budget: resource.budget,
		canViewBudget: resource.canViewBudget,
		deadline: resource.deadline,
		uiApprovedAt: resource.uiApprovedAt,
		progress: resource.progress,
		totalTimeSpent: resource.totalTimeSpent,
		isPinned: resource.isPinned,
		client: resource.client,
		members: resource.members,
		files: resource.files,
		createdAt: resource.createdAt,
		updatedAt: resource.updatedAt,
		createdBy: resource.createdBy,
		updatedBy: resource.updatedBy,
	};
}

export function mapProjectListResponse(response: RawProjectListResponse): ProjectListResponse {
	return {
		projects: response.projects.map(mapProjectResource),
		pagination: response.pagination,
	};
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

	if (filters?.deadlineFrom) {
		params.append("filter[deadlineFrom]", filters.deadlineFrom);
	}

	if (filters?.deadlineTo) {
		params.append("filter[deadlineTo]", filters.deadlineTo);
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
		const response = await api.get<ApiEnvelope<RawProjectListResponse>>(query ? `/projects?${query}` : "/projects");

		return mapProjectListResponse(response.data.data);
	},

	async getClientProjects(clientId: number): Promise<ClientProjectListResponse> {
		const response = await api.get<ApiEnvelope<ClientProjectListResponse>>(`/clients/${clientId}/projects`);

		return response.data.data;
	},

	async getProjectById(id: number): Promise<Project> {
		const response = await api.get<ApiEnvelope<RawProjectResource>>(`/projects/${id}`);

		return mapProjectResource(response.data.data);
	},

	async getProjectMembers(id: number): Promise<ProjectMemberListResponse> {
		const response = await api.get<ApiEnvelope<ProjectMemberListResponse>>(`/projects/${id}/members`);

		return response.data.data;
	},

	async createProject(payload: CreateProjectPayload): Promise<Project> {
		const response = await api.post<ApiEnvelope<RawProjectResource>>("/projects", payload);

		return mapProjectResource(response.data.data);
	},

	async createDirectProject(payload: CreateDirectProjectPayload): Promise<Project> {
		const response = await api.post<ApiEnvelope<RawProjectResource>>("/projects/direct", payload);

		return mapProjectResource(response.data.data);
	},

	async updateProject(id: number, payload: UpdateProjectPayload): Promise<Project> {
		const response = await api.put<ApiEnvelope<RawProjectResource>>(`/projects/${id}`, payload);

		return mapProjectResource(response.data.data);
	},

	async deleteProject(id: number): Promise<void> {
		await api.delete(`/projects/${id}`);
	},

	async convertQuotation(payload: ConvertQuotationPayload): Promise<Project> {
		const response = await api.post<ApiEnvelope<RawProjectResource>>("/projects/convert", payload);

		return mapProjectResource(response.data.data);
	},

	async approveUI(id: number): Promise<Project> {
		const response = await api.post<ApiEnvelope<RawProjectResource>>(`/projects/${id}/approve-ui`);

		return mapProjectResource(response.data.data);
	},

	async getPinnedProjects(): Promise<Project[]> {
		const response = await api.get<ApiEnvelope<RawProjectResource[]>>("/projects/pinned");

		return response.data.data.map(mapProjectResource);
	},

	async pinProject(id: number): Promise<void> {
		await api.post(`/projects/${id}/pin`);
	},

	async unpinProject(id: number): Promise<void> {
		await api.delete(`/projects/${id}/pin`);
	},
};

export function useGetClientProjects(clientId: number, enabled = true) {
	return useQuery({
		queryKey: projectKeys.client(clientId),
		queryFn: async () => {
			const response = await projectApi.getClientProjects(clientId);

			return response.projects;
		},
		enabled: enabled && clientId > 0,
		staleTime: 5 * 60 * 1000,
	});
}
