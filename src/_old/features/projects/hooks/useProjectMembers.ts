import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectMembersApi } from "../api/projectMembers";
import { ProjectMember, CreateProjectMemberPayload, UpdateProjectMemberPayload, ProjectMemberListResponse } from "../types/projectMember";
import { projectKeys } from "./useProjects";

export const projectMemberKeys = {
	all: ["projectMembers"] as const,
	lists: () => [...projectMemberKeys.all, "list"] as const,
	list: (projectId: number) => [...projectMemberKeys.lists(), projectId] as const,
};

/**
 * Hook to fetch all members for a project
 */
export const useProjectMembers = (projectId: number, enabled = true) => {
	return useQuery<ProjectMemberListResponse, Error>({
		queryKey: projectMemberKeys.list(projectId),
		queryFn: () => projectMembersApi.getAll(projectId),
		enabled: enabled && !!projectId,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

/**
 * Hook to add a member to a project
 */
export const useAddProjectMember = () => {
	const queryClient = useQueryClient();

	return useMutation<ProjectMember, Error, { projectId: number; payload: CreateProjectMemberPayload }>({
		mutationFn: ({ projectId, payload }) => projectMembersApi.create(projectId, payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: projectMemberKeys.list(variables.projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
		},
	});
};

/**
 * Hook to update a member's role
 */
export const useUpdateProjectMember = () => {
	const queryClient = useQueryClient();

	return useMutation<ProjectMember, Error, { projectId: number; memberId: number; payload: UpdateProjectMemberPayload }>({
		mutationFn: ({ projectId, memberId, payload }) => projectMembersApi.update(projectId, memberId, payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: projectMemberKeys.list(variables.projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
		},
	});
};

/**
 * Hook to remove a member from a project
 */
export const useRemoveProjectMember = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, { projectId: number; memberId: number }>({
		mutationFn: ({ projectId, memberId }) => projectMembersApi.delete(projectId, memberId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: projectMemberKeys.list(variables.projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
		},
	});
};
