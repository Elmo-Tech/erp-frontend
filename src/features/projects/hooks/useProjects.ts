import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../api/projects";
import { Project, CreateProjectPayload, CreateDirectProjectPayload, UpdateProjectPayload, ProjectFilters, ProjectListResponse } from "../types/project";
import { projectHistoryKeys } from "./useProjectHistory";
import { clientKeys } from "@/features/clients/hooks/useClients";

/**
 * TanStack Query hooks for project management
 * Implements requirement 11.7: Frontend hooks for project operations
 */

// Query keys for consistent cache management
export const projectKeys = {
	all: ["projects"] as const,
	lists: () => [...projectKeys.all, "list"] as const,
	list: (filters?: ProjectFilters) => [...projectKeys.lists(), filters] as const,
	details: () => [...projectKeys.all, "detail"] as const,
	detail: (id: number) => [...projectKeys.details(), id] as const,
};

/**
 * Hook to fetch all projects with optional filtering and pagination
 * Requirement 11.7: Frontend hooks for project operations
 */
export const useProjects = (filters?: ProjectFilters) => {
	return useQuery<ProjectListResponse, Error>({
		queryKey: projectKeys.list(filters),
		queryFn: () => projectsApi.getAll(filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to fetch a single project by ID
 * Requirement 11.7: Frontend hooks for project operations
 */
export const useProject = (id: number, enabled = true) => {
	return useQuery<Project, Error>({
		queryKey: projectKeys.detail(id),
		queryFn: () => projectsApi.getById(id),
		enabled: enabled && !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to create a new project (direct creation)
 * Requirement 11.7: Frontend hooks for project operations
 */
export const useCreateProject = () => {
	const queryClient = useQueryClient();

	return useMutation<Project, Error, CreateProjectPayload>({
		mutationFn: projectsApi.create,
		onSuccess: (newProject) => {
			// Invalidate and refetch projects list
			queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

			// Add the new project to the cache
			queryClient.setQueryData(projectKeys.detail(newProject.projectId), newProject);
		},
		onError: (error) => {
			console.error("Failed to create project:", error);
		},
	});
};

/**
 * Hook to create a new project directly for a client (without quotation)
 */
export const useCreateDirectProject = () => {
	const queryClient = useQueryClient();

	return useMutation<Project, Error, CreateDirectProjectPayload>({
		mutationFn: projectsApi.createDirect,
		onSuccess: (newProject) => {
			// Invalidate and refetch projects list
			queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

			// Add the new project to the cache
			queryClient.setQueryData(projectKeys.detail(newProject.projectId), newProject);

			// Invalidate client details to refresh projects list
			if (newProject.clientId) {
				queryClient.invalidateQueries({ queryKey: clientKeys.detail(newProject.clientId) });
			}
		},
		onError: (error) => {
			console.error("Failed to create project:", error);
		},
	});
};

/**
 * Hook to update an existing project with history tracking
 * Requirement 11.7: Frontend hooks for project operations
 */
export const useUpdateProject = () => {
	const queryClient = useQueryClient();

	return useMutation<Project, Error, { id: number; payload: UpdateProjectPayload }>({
		mutationFn: ({ id, payload }) => projectsApi.update(id, payload),
		onSuccess: (updatedProject) => {
			// Update the specific project in cache
			queryClient.setQueryData(projectKeys.detail(updatedProject.projectId), updatedProject);

			// Invalidate lists to ensure consistency
			queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

			// Invalidate project history since updates create history entries
			queryClient.invalidateQueries({ queryKey: projectHistoryKeys.list(updatedProject.projectId) });
		},
		onError: (error) => {
			console.error("Failed to update project:", error);
		},
	});
};

/**
 * Hook to delete a project
 * Requirement 11.7: Frontend hooks for project operations
 */
export const useDeleteProject = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: projectsApi.delete,
		onSuccess: (_, deletedId) => {
			// Remove the project from cache
			queryClient.removeQueries({ queryKey: projectKeys.detail(deletedId) });

			// Invalidate lists to ensure consistency
			queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
		},
		onError: (error) => {
			console.error("Failed to delete project:", error);
		},
	});
};

/**
 * Hook to manually approve UI/UX phase
 * Requirement 5.7: POST /api/v1/projects/{id}/approve-ui endpoint for manual UI approval
 */
export const useApproveUI = () => {
	const queryClient = useQueryClient();

	return useMutation<Project, Error, number>({
		mutationFn: projectsApi.approveUI,
		onSuccess: (updatedProject) => {
			// Update the specific project in cache
			queryClient.setQueryData(projectKeys.detail(updatedProject.projectId), updatedProject);

			// Invalidate lists to ensure consistency
			queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

			// Invalidate project history since approval creates history entries
			queryClient.invalidateQueries({ queryKey: projectHistoryKeys.list(updatedProject.projectId) });
		},
		onError: (error) => {
			console.error("Failed to approve UI:", error);
		},
	});
};

/**
 * Hook to prefetch a project (useful for hover states or navigation)
 * Requirement 11.7: Frontend hooks for project operations
 */
export const usePrefetchProject = () => {
	const queryClient = useQueryClient();

	return (id: number) => {
		queryClient.prefetchQuery({
			queryKey: projectKeys.detail(id),
			queryFn: () => projectsApi.getById(id),
			staleTime: 5 * 60 * 1000, // 5 minutes
		});
	};
};
