/**
 * Client Portal Invoices Hooks
 * TanStack Query hooks for client invoice management.
 *
 * Requirements: 15.1
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientInvoicesApi } from "../api/clientInvoices";
import { ClientInvoice, ClientInvoiceFilters, ClientInvoiceListResponse } from "../types/clientInvoice";

/**
 * Query keys for consistent cache management
 */
export const clientInvoiceKeys = {
	all: ["clientInvoices"] as const,
	lists: () => [...clientInvoiceKeys.all, "list"] as const,
	list: (filters?: ClientInvoiceFilters) => [...clientInvoiceKeys.lists(), filters] as const,
	details: () => [...clientInvoiceKeys.all, "detail"] as const,
	detail: (id: number) => [...clientInvoiceKeys.details(), id] as const,
};

/**
 * Hook to fetch all client invoices with optional filtering and pagination
 * Requirement 15.1: ClientInvoiceList component SHALL display invoices
 */
export const useClientInvoices = (filters?: ClientInvoiceFilters) => {
	return useQuery<ClientInvoiceListResponse, Error>({
		queryKey: clientInvoiceKeys.list(filters),
		queryFn: () => clientInvoicesApi.getAll(filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to fetch a single client invoice by ID
 * Requirement 15.1: ClientInvoiceList component SHALL display invoice details
 */
export const useClientInvoice = (id: number, enabled = true) => {
	return useQuery<ClientInvoice, Error>({
		queryKey: clientInvoiceKeys.detail(id),
		queryFn: () => clientInvoicesApi.getById(id),
		enabled: enabled && !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to pay an invoice
 * Requirement 15.3: ClientInvoiceList component SHALL provide a "Pay Now" button
 */
export const usePayInvoice = () => {
	const queryClient = useQueryClient();

	return useMutation<ClientInvoice, Error, number>({
		mutationFn: clientInvoicesApi.pay,
		onSuccess: (updatedInvoice) => {
			// Update the specific invoice in cache
			queryClient.setQueryData(clientInvoiceKeys.detail(updatedInvoice.invoiceId), updatedInvoice);

			// Invalidate lists to ensure consistency
			queryClient.invalidateQueries({ queryKey: clientInvoiceKeys.lists() });
		},
		onError: (error) => {
			console.error("Failed to pay invoice:", error);
		},
	});
};

/**
 * Hook to prefetch a client invoice (useful for hover states or navigation)
 */
export const usePrefetchClientInvoice = () => {
	const queryClient = useQueryClient();

	return (id: number) => {
		queryClient.prefetchQuery({
			queryKey: clientInvoiceKeys.detail(id),
			queryFn: () => clientInvoicesApi.getById(id),
			staleTime: 5 * 60 * 1000, // 5 minutes
		});
	};
};
