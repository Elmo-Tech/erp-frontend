import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationsApi } from "../api/quotations";
import { Quotation, CreateQuotationPayload, UpdateQuotationPayload, QuotationFilters, QuotationListResponse } from "../types/quotation";

/**
 * TanStack Query hooks for quotation management
 * Implements requirements 9.3, 9.4: Frontend hooks for quotation operations
 */

// Query keys for consistent cache management
export const quotationKeys = {
	all: ["quotations"] as const,
	lists: () => [...quotationKeys.all, "list"] as const,
	list: (filters?: QuotationFilters) => [...quotationKeys.lists(), filters] as const,
	details: () => [...quotationKeys.all, "detail"] as const,
	detail: (id: number) => [...quotationKeys.details(), id] as const,
	byLead: (leadId: number) => [...quotationKeys.all, "byLead", leadId] as const,
};

/**
 * Hook to fetch all quotations with optional filtering and pagination
 * Requirement 9.3: Frontend hooks for quotation operations
 */
export const useQuotations = (filters?: QuotationFilters) => {
	return useQuery<QuotationListResponse, Error>({
		queryKey: quotationKeys.list(filters),
		queryFn: () => quotationsApi.getAll(filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to fetch a single quotation by ID
 * Requirement 9.3: Frontend hooks for quotation operations
 */
export const useQuotation = (id: number, enabled = true) => {
	return useQuery<Quotation, Error>({
		queryKey: quotationKeys.detail(id),
		queryFn: () => quotationsApi.getById(id),
		enabled: enabled && !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to fetch quotations for a specific lead
 * Requirement 9.3: Frontend hooks for quotation operations
 */
export const useQuotationsByLead = (leadId: number, enabled = true) => {
	return useQuery<QuotationListResponse, Error>({
		queryKey: quotationKeys.byLead(leadId),
		queryFn: () => quotationsApi.getAll({ leadId }),
		enabled: enabled && !!leadId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to create a new quotation
 * Requirement 9.4: Frontend hooks for quotation operations
 */
export const useCreateQuotation = () => {
	const queryClient = useQueryClient();

	return useMutation<Quotation, Error, CreateQuotationPayload>({
		mutationFn: quotationsApi.create,
		onSuccess: (newQuotation) => {
			// Invalidate and refetch quotations list
			queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });

			// Invalidate quotations for the specific lead
			queryClient.invalidateQueries({ queryKey: quotationKeys.byLead(newQuotation.leadId) });

			// Add the new quotation to the cache
			queryClient.setQueryData(quotationKeys.detail(newQuotation.quotationId), newQuotation);
		},
		onError: (error) => {
			console.error("Failed to create quotation:", error);
		},
	});
};

/**
 * Hook to update an existing quotation
 * Requirement 9.4: Frontend hooks for quotation operations
 */
export const useUpdateQuotation = () => {
	const queryClient = useQueryClient();

	return useMutation<Quotation, Error, { id: number; payload: UpdateQuotationPayload }>({
		mutationFn: ({ id, payload }) => quotationsApi.update(id, payload),
		onSuccess: (updatedQuotation, variables) => {
			// Update the specific quotation in cache
			queryClient.setQueryData(quotationKeys.detail(updatedQuotation.quotationId), updatedQuotation);

			// Invalidate lists to ensure consistency
			queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });

			// Invalidate quotations for the specific lead
			queryClient.invalidateQueries({ queryKey: quotationKeys.byLead(updatedQuotation.leadId) });

			// If leadId changed, also invalidate the old lead's quotations
			if (variables.payload.leadId && variables.payload.leadId !== updatedQuotation.leadId) {
				queryClient.invalidateQueries({ queryKey: quotationKeys.byLead(variables.payload.leadId) });
			}
		},
		onError: (error) => {
			console.error("Failed to update quotation:", error);
		},
	});
};

/**
 * Hook to delete a quotation
 * Requirement 9.4: Frontend hooks for quotation operations
 */
export const useDeleteQuotation = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, { id: number; leadId: number }>({
		mutationFn: ({ id }) => quotationsApi.delete(id),
		onSuccess: (_, { id, leadId }) => {
			// Remove the quotation from cache
			queryClient.removeQueries({ queryKey: quotationKeys.detail(id) });

			// Invalidate lists to ensure consistency
			queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });

			// Invalidate quotations for the specific lead
			queryClient.invalidateQueries({ queryKey: quotationKeys.byLead(leadId) });
		},
		onError: (error) => {
			console.error("Failed to delete quotation:", error);
		},
	});
};

/**
 * Hook to prefetch a quotation (useful for hover states or navigation)
 * Requirement 9.3: Frontend hooks for quotation operations
 */
export const usePrefetchQuotation = () => {
	const queryClient = useQueryClient();

	return (id: number) => {
		queryClient.prefetchQuery({
			queryKey: quotationKeys.detail(id),
			queryFn: () => quotationsApi.getById(id),
			staleTime: 5 * 60 * 1000, // 5 minutes
		});
	};
};

/**
 * Hook to prefetch quotations for a specific lead
 * Requirement 9.3: Frontend hooks for quotation operations
 */
export const usePrefetchQuotationsByLead = () => {
	const queryClient = useQueryClient();

	return (leadId: number) => {
		queryClient.prefetchQuery({
			queryKey: quotationKeys.byLead(leadId),
			queryFn: () => quotationsApi.getAll({ leadId }),
			staleTime: 5 * 60 * 1000, // 5 minutes
		});
	};
};
