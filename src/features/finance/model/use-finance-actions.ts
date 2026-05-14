/**
 * features/finance/model/use-finance-actions.ts
 *
 * All React Query hooks (queries + mutations) for the Finance domain.
 * Imports raw fetchers from entities/finance/api/finance.api.ts.
 *
 * Mutation hooks MUST call queryClient.invalidateQueries on success (No Refresh Rule).
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { financeKeys } from "@/entities/finance/model/query-keys";
import * as financeApi from "@/entities/finance/api/finance.api";
import type { CreateInvoicePayload, CreateSubscriptionPayload, UpdateInvoicePayload, UpdateSubscriptionPayload } from "@/entities/finance/model/types";

// ═════════════════════════════════════════════════════════════════════════════
// INVOICES
// ═════════════════════════════════════════════════════════════════════════════

/** Returns PaginatedResponse<Invoice> — widgets extract .data for the array */
export function useInvoices(params?: { clientId?: number }) {
	return useQuery({
		queryKey: financeKeys.invoiceList(params),
		queryFn: () => financeApi.fetchInvoices(params),
		staleTime: 5 * 60 * 1000,
	});
}

/** Fetch a single invoice with all relations (client, project, items) */
export function useInvoice(id: number | null) {
	return useQuery({
		queryKey: financeKeys.invoiceDetail(id ?? 0),
		queryFn: () => financeApi.fetchInvoice(id!),
		enabled: id !== null && id > 0,
		staleTime: 5 * 60 * 1000,
	});
}

export function useCreateInvoice() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateInvoicePayload) => financeApi.postInvoice(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: financeKeys.invoices() });
		},
	});
}

export function useUpdateInvoice() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateInvoicePayload }) => financeApi.putInvoice(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: financeKeys.invoices() });
		},
	});
}

export function useDeleteInvoice() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => financeApi.deleteInvoice(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: financeKeys.invoices() });
		},
	});
}

// ═════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTIONS
// ═════════════════════════════════════════════════════════════════════════════

/** Returns PaginatedResponse<Subscription> — widgets extract .data for the array */
export function useSubscriptions() {
	return useQuery({
		queryKey: financeKeys.subscriptionList(),
		queryFn: financeApi.fetchSubscriptions,
		staleTime: 5 * 60 * 1000,
	});
}

export function useCreateSubscription() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateSubscriptionPayload) => financeApi.postSubscription(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: financeKeys.subscriptions() });
		},
	});
}

export function useUpdateSubscription() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateSubscriptionPayload }) => financeApi.putSubscription(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: financeKeys.subscriptions() });
		},
	});
}

export function useDeleteSubscription() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => financeApi.deleteSubscription(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: financeKeys.subscriptions() });
		},
	});
}
