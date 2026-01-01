/**
 * Client Portal Projects Hooks
 * TanStack Query hooks for client project management.
 *
 * Requirements: 13.1, 14.1
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clientProjectsApi } from "../api/clientProjects";
import { ClientProject, ClientProjectFilters, ClientProjectListResponse } from "../types/clientProject";

/**
 * Query keys for consistent cache management
 */
export const clientProjectKeys = {
	all: ["clientProjects"] as const,
	lists: () => [...clientProjectKeys.all, "list"] as const,
	list: (filters?: ClientProjectFilters) => [...clientProjectKeys.lists(), filters] as const,
	details: () => [...clientProjectKeys.all, "detail"] as const,
	detail: (id: number) => [...clientProjectKeys.details(), id] as const,
};

/**
 * Hook to fetch all client projects with optional filtering and pagination
 * Requirement 13.1: ClientDashboard component SHALL display a list of client's projects
 */
export const useClientProjects = (filters?: ClientProjectFilters) => {
	return useQuery<ClientProjectListResponse, Error>({
		queryKey: clientProjectKeys.list(filters),
		queryFn: () => clientProjectsApi.getAll(filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to fetch a single client project by ID
 * Requirement 14.1: ClientProjectView component SHALL display project details
 */
export const useClientProject = (id: number, enabled = true) => {
	return useQuery<ClientProject, Error>({
		queryKey: clientProjectKeys.detail(id),
		queryFn: () => clientProjectsApi.getById(id),
		enabled: enabled && !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to prefetch a client project (useful for hover states or navigation)
 */
export const usePrefetchClientProject = () => {
	const queryClient = useQueryClient();

	return (id: number) => {
		queryClient.prefetchQuery({
			queryKey: clientProjectKeys.detail(id),
			queryFn: () => clientProjectsApi.getById(id),
			staleTime: 5 * 60 * 1000, // 5 minutes
		});
	};
};
