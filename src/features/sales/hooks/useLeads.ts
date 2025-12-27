import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "../api/leads";
import { Lead, CreateLeadPayload, UpdateLeadPayload, LeadFilters, LeadListResponse } from "../types/lead";

/**
 * TanStack Query hooks for lead management
 * Implements requirement 10.5: Frontend hooks for lead operations
 */

// Query keys for consistent cache management
export const leadKeys = {
	all: ["leads"] as const,
	lists: () => [...leadKeys.all, "list"] as const,
	list: (filters?: LeadFilters) => [...leadKeys.lists(), filters] as const,
	details: () => [...leadKeys.all, "detail"] as const,
	detail: (id: number) => [...leadKeys.details(), id] as const,
};

/**
 * Hook to fetch all leads with optional filtering and pagination
 * Requirement 10.5: Frontend hooks for lead operations
 */
export const useLeads = (filters?: LeadFilters) => {
	return useQuery<LeadListResponse, Error>({
		queryKey: leadKeys.list(filters),
		queryFn: () => leadsApi.getAll(filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to fetch a single lead by ID
 * Requirement 10.5: Frontend hooks for lead operations
 */
export const useLead = (id: number, enabled = true) => {
	return useQuery<Lead, Error>({
		queryKey: leadKeys.detail(id),
		queryFn: () => leadsApi.getById(id),
		enabled: enabled && !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to create a new lead
 * Requirement 10.5: Frontend hooks for lead operations
 */
export const useCreateLead = () => {
	const queryClient = useQueryClient();

	return useMutation<Lead, Error, CreateLeadPayload>({
		mutationFn: leadsApi.create,
		onSuccess: (newLead) => {
			// Invalidate and refetch leads list
			queryClient.invalidateQueries({ queryKey: leadKeys.lists() });

			// Add the new lead to the cache
			queryClient.setQueryData(leadKeys.detail(newLead.leadId), newLead);
		},
		onError: (error) => {
			console.error("Failed to create lead:", error);
		},
	});
};

/**
 * Hook to update an existing lead
 * Requirement 10.5: Frontend hooks for lead operations
 */
export const useUpdateLead = () => {
	const queryClient = useQueryClient();

	return useMutation<Lead, Error, { id: number; payload: UpdateLeadPayload }>({
		mutationFn: ({ id, payload }) => leadsApi.update(id, payload),
		onSuccess: (updatedLead) => {
			// Update the specific lead in cache
			queryClient.setQueryData(leadKeys.detail(updatedLead.leadId), updatedLead);

			// Invalidate lists to ensure consistency
			queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
		},
		onError: (error) => {
			console.error("Failed to update lead:", error);
		},
	});
};

/**
 * Hook to delete a lead
 * Requirement 10.5: Frontend hooks for lead operations
 */
export const useDeleteLead = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: leadsApi.delete,
		onSuccess: (_, deletedId) => {
			// Remove the lead from cache
			queryClient.removeQueries({ queryKey: leadKeys.detail(deletedId) });

			// Invalidate lists to ensure consistency
			queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
		},
		onError: (error) => {
			console.error("Failed to delete lead:", error);
		},
	});
};

/**
 * Hook to prefetch a lead (useful for hover states or navigation)
 * Requirement 10.5: Frontend hooks for lead operations
 */
export const usePrefetchLead = () => {
	const queryClient = useQueryClient();

	return (id: number) => {
		queryClient.prefetchQuery({
			queryKey: leadKeys.detail(id),
			queryFn: () => leadsApi.getById(id),
			staleTime: 5 * 60 * 1000, // 5 minutes
		});
	};
};
