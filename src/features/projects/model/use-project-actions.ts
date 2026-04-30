"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientKeys } from "@/entities/client/model/query-keys";
import { projectApi } from "@/entities/project/api/project.api";
import { projectKeys } from "@/entities/project/model/query-keys";
import type { ConvertQuotationPayload, CreateDirectProjectPayload, CreateProjectPayload, Project, UpdateProjectPayload } from "@/entities/project/model/types";

export function useCreateProject() {
	const queryClient = useQueryClient();

	return useMutation<Project, Error, CreateProjectPayload>({
		mutationFn: projectApi.createProject,
		onSuccess: (newProject) => {
			queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
			queryClient.setQueryData(projectKeys.detail(newProject.projectId), newProject);
		},
	});
}

export function useCreateDirectProject() {
	const queryClient = useQueryClient();

	return useMutation<Project, Error, CreateDirectProjectPayload>({
		mutationFn: projectApi.createDirectProject,
		onSuccess: (newProject) => {
			queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
			queryClient.setQueryData(projectKeys.detail(newProject.projectId), newProject);

			if (newProject.clientId) {
				queryClient.invalidateQueries({ queryKey: projectKeys.client(newProject.clientId) });
				queryClient.invalidateQueries({ queryKey: clientKeys.detail(newProject.clientId) });
				queryClient.invalidateQueries({ queryKey: clientKeys.activities(newProject.clientId) });
			}
		},
	});
}

export function useUpdateProject() {
	const queryClient = useQueryClient();

	return useMutation<Project, Error, { id: number; payload: UpdateProjectPayload }>({
		mutationFn: ({ id, payload }) => projectApi.updateProject(id, payload),
		onSuccess: (updatedProject) => {
			queryClient.setQueryData(projectKeys.detail(updatedProject.projectId), updatedProject);
			queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

			if (updatedProject.clientId) {
				queryClient.invalidateQueries({ queryKey: clientKeys.detail(updatedProject.clientId) });
			}
		},
	});
}

export function useDeleteProject() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: projectApi.deleteProject,
		onSuccess: (_, deletedId) => {
			queryClient.removeQueries({ queryKey: projectKeys.detail(deletedId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
			queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
		},
	});
}

export function useConvertQuotationToProject() {
	const queryClient = useQueryClient();

	return useMutation<Project, Error, ConvertQuotationPayload>({
		mutationFn: projectApi.convertQuotation,
		onSuccess: (newProject) => {
			queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
			queryClient.setQueryData(projectKeys.detail(newProject.projectId), newProject);

			if (newProject.clientId) {
				queryClient.invalidateQueries({ queryKey: clientKeys.detail(newProject.clientId) });
			}
		},
	});
}

export function usePinProject() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: projectApi.pinProject,
		onSuccess: (_, projectId) => {
			queryClient.invalidateQueries({ queryKey: projectKeys.pinned() });
			queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
		},
	});
}

export function useUnpinProject() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: projectApi.unpinProject,
		onSuccess: (_, projectId) => {
			queryClient.invalidateQueries({ queryKey: projectKeys.pinned() });
			queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
		},
	});
}
