import { useQuery, useQueryClient } from "@tanstack/react-query";
import { projectHistoryApi } from "../api/projectHistory";
import { ProjectHistoryListResponse } from "../types/projectHistory";

/**
 * TanStack Query hooks for project history management
 * Implements requirement 13.5: Frontend hooks for project history operations
 */

// Query keys for consistent cache management
export const projectHistoryKeys = {
	all: ["projectHistory"] as const,
	lists: () => [...projectHistoryKeys.all, "list"] as const,
	list: (projectId: number, fieldName?: string) => [...projectHistoryKeys.lists(), projectId, fieldName] as const,
};

/**
 * Hook to fetch history for a project with optional field filter
 * Requirement 13.5: Frontend hooks for project history operations
 */
export const useProjectHistory = (projectId: number, fieldName?: string, enabled = true) => {
	return useQuery<ProjectHistoryListResponse, Error>({
		queryKey: projectHistoryKeys.list(projectId, fieldName),
		queryFn: () => projectHistoryApi.getAll(projectId, fieldName),
		enabled: enabled && !!projectId,
		staleTime: 2 * 60 * 1000, // 2 minutes (shorter than other queries since history changes frequently)
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
};

/**
 * Hook to prefetch project history (useful for tab switching or navigation)
 * Requirement 13.5: Frontend hooks for project history operations
 */
export const usePrefetchProjectHistory = () => {
	const queryClient = useQueryClient();

	return (projectId: number, fieldName?: string) => {
		queryClient.prefetchQuery({
			queryKey: projectHistoryKeys.list(projectId, fieldName),
			queryFn: () => projectHistoryApi.getAll(projectId, fieldName),
			staleTime: 2 * 60 * 1000, // 2 minutes
		});
	};
};

/**
 * Hook to invalidate project history cache (useful after project updates)
 * This is a utility hook that can be used by other hooks to ensure history is refreshed
 * after project changes that would create new history entries
 */
export const useInvalidateProjectHistory = () => {
	const queryClient = useQueryClient();

	return (projectId: number) => {
		queryClient.invalidateQueries({ queryKey: projectHistoryKeys.list(projectId) });
	};
};
