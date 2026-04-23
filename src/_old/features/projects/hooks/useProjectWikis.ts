import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectWikisApi } from "../api/projectWikis";
import { ProjectWiki, CreateProjectWikiPayload, UpdateProjectWikiPayload, ProjectWikiListResponse } from "../types/projectWiki";

/**
 * TanStack Query hooks for project wiki management
 * Implements requirements 12.6, 12.7, 12.8: Frontend hooks for project wiki operations
 */

// Query keys for consistent cache management
export const projectWikiKeys = {
	all: ["projectWikis"] as const,
	lists: () => [...projectWikiKeys.all, "list"] as const,
	list: (projectId: number) => [...projectWikiKeys.lists(), projectId] as const,
	details: () => [...projectWikiKeys.all, "detail"] as const,
	detail: (projectId: number, wikiId: number) => [...projectWikiKeys.details(), projectId, wikiId] as const,
};

/**
 * Hook to fetch all wikis for a project
 * Requirement 12.6: Frontend hooks for project wiki operations
 */
export const useProjectWikis = (projectId: number, enabled = true) => {
	return useQuery<ProjectWikiListResponse, Error>({
		queryKey: projectWikiKeys.list(projectId),
		queryFn: () => projectWikisApi.getAll(projectId),
		enabled: enabled && !!projectId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to fetch a single wiki entry by ID
 * Requirement 12.6: Frontend hooks for project wiki operations
 */
export const useProjectWiki = (projectId: number, wikiId: number, enabled = true) => {
	return useQuery<ProjectWiki, Error>({
		queryKey: projectWikiKeys.detail(projectId, wikiId),
		queryFn: () => projectWikisApi.getById(projectId, wikiId),
		enabled: enabled && !!projectId && !!wikiId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to create a new wiki entry
 * Requirement 12.7: Frontend hooks for project wiki operations
 */
export const useCreateProjectWiki = () => {
	const queryClient = useQueryClient();

	return useMutation<ProjectWiki, Error, { projectId: number; payload: CreateProjectWikiPayload }>({
		mutationFn: ({ projectId, payload }) => projectWikisApi.create(projectId, payload),
		onSuccess: (newWiki, variables) => {
			// Add the new wiki to the cache
			queryClient.setQueryData(projectWikiKeys.detail(variables.projectId, newWiki.wikiId), newWiki);

			// Invalidate and refetch wikis list for the project
			queryClient.invalidateQueries({ queryKey: projectWikiKeys.list(variables.projectId) });
		},
		onError: (error) => {
			console.error("Failed to create project wiki:", error);
		},
	});
};

/**
 * Hook to update an existing wiki entry
 * Requirement 12.8: Frontend hooks for project wiki operations
 */
export const useUpdateProjectWiki = () => {
	const queryClient = useQueryClient();

	return useMutation<ProjectWiki, Error, { projectId: number; wikiId: number; payload: UpdateProjectWikiPayload }>({
		mutationFn: ({ projectId, wikiId, payload }) => projectWikisApi.update(projectId, wikiId, payload),
		onSuccess: (updatedWiki, variables) => {
			// Update the specific wiki in cache
			queryClient.setQueryData(projectWikiKeys.detail(variables.projectId, variables.wikiId), updatedWiki);

			// Invalidate wikis list to ensure consistency
			queryClient.invalidateQueries({ queryKey: projectWikiKeys.list(variables.projectId) });
		},
		onError: (error) => {
			console.error("Failed to update project wiki:", error);
		},
	});
};

/**
 * Hook to delete a wiki entry
 * Requirement 12.8: Frontend hooks for project wiki operations
 */
export const useDeleteProjectWiki = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, { projectId: number; wikiId: number }>({
		mutationFn: ({ projectId, wikiId }) => projectWikisApi.delete(projectId, wikiId),
		onSuccess: (_, { projectId, wikiId }) => {
			// Remove the wiki from cache
			queryClient.removeQueries({ queryKey: projectWikiKeys.detail(projectId, wikiId) });

			// Invalidate wikis list to ensure consistency
			queryClient.invalidateQueries({ queryKey: projectWikiKeys.list(projectId) });
		},
		onError: (error) => {
			console.error("Failed to delete project wiki:", error);
		},
	});
};

/**
 * Hook to prefetch a project wiki (useful for hover states or navigation)
 * Requirement 12.6: Frontend hooks for project wiki operations
 */
export const usePrefetchProjectWiki = () => {
	const queryClient = useQueryClient();

	return (projectId: number, wikiId: number) => {
		queryClient.prefetchQuery({
			queryKey: projectWikiKeys.detail(projectId, wikiId),
			queryFn: () => projectWikisApi.getById(projectId, wikiId),
			staleTime: 5 * 60 * 1000, // 5 minutes
		});
	};
};

/**
 * Hook to prefetch project wikis for a specific project
 * Requirement 12.6: Frontend hooks for project wiki operations
 */
export const usePrefetchProjectWikis = () => {
	const queryClient = useQueryClient();

	return (projectId: number) => {
		queryClient.prefetchQuery({
			queryKey: projectWikiKeys.list(projectId),
			queryFn: () => projectWikisApi.getAll(projectId),
			staleTime: 5 * 60 * 1000, // 5 minutes
		});
	};
};
