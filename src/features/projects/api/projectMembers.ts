import api from "@/lib/axios";
import { ProjectMember, CreateProjectMemberPayload, UpdateProjectMemberPayload, ProjectMemberListResponse } from "../types/projectMember";

/**
 * API functions for project member management
 */
export const projectMembersApi = {
	/**
	 * Get all members for a project
	 */
	getAll: async (projectId: number): Promise<ProjectMemberListResponse> => {
		const response = await api.get<{ data: ProjectMemberListResponse }>(`/projects/${projectId}/members`);
		return response.data.data;
	},

	/**
	 * Add a member to a project
	 */
	create: async (projectId: number, payload: CreateProjectMemberPayload): Promise<ProjectMember> => {
		const response = await api.post<{ data: ProjectMember }>(`/projects/${projectId}/members`, payload);
		return response.data.data;
	},

	/**
	 * Update a member's role
	 */
	update: async (projectId: number, memberId: number, payload: UpdateProjectMemberPayload): Promise<ProjectMember> => {
		const response = await api.put<{ data: ProjectMember }>(`/projects/${projectId}/members/${memberId}`, payload);
		return response.data.data;
	},

	/**
	 * Remove a member from a project
	 */
	delete: async (projectId: number, memberId: number): Promise<void> => {
		await api.delete(`/projects/${projectId}/members/${memberId}`);
	},
};
