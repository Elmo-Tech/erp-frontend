"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientKeys } from "@/entities/client/model/query-keys";
import { invoiceApi } from "@/entities/invoice/api/invoice.api";
import { invoiceKeys } from "@/entities/invoice/model/query-keys";
import type { CreateInvoicePayload, Invoice, UpdateInvoicePayload } from "@/entities/invoice/model/types";
import { projectKeys } from "@/entities/project/model/query-keys";

function invalidateInvoiceCollections(queryClient: ReturnType<typeof useQueryClient>, invoice?: Pick<Invoice, "invoiceId" | "projectId"> | null, clientId?: number) {
	queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });

	if (invoice?.projectId) {
		queryClient.invalidateQueries({ queryKey: projectKeys.detail(invoice.projectId) });
	}

	if (clientId) {
		queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });
	}
}

export function useCreateInvoice(clientId?: number) {
	const queryClient = useQueryClient();

	return useMutation<Invoice, Error, CreateInvoicePayload>({
		mutationFn: invoiceApi.createInvoice,
		onSuccess: (newInvoice) => {
			queryClient.setQueryData(invoiceKeys.detail(newInvoice.invoiceId), newInvoice);
			invalidateInvoiceCollections(queryClient, newInvoice, clientId);
		},
	});
}

export function useUpdateInvoice(clientId?: number) {
	const queryClient = useQueryClient();

	return useMutation<Invoice, Error, { id: number; payload: UpdateInvoicePayload }>({
		mutationFn: ({ id, payload }) => invoiceApi.updateInvoice(id, payload),
		onSuccess: (updatedInvoice) => {
			queryClient.setQueryData(invoiceKeys.detail(updatedInvoice.invoiceId), updatedInvoice);
			invalidateInvoiceCollections(queryClient, updatedInvoice, clientId);
		},
	});
}

export function useMarkInvoiceAsPaid(clientId?: number) {
	const queryClient = useQueryClient();

	return useMutation<Invoice, Error, number>({
		mutationFn: invoiceApi.markInvoiceAsPaid,
		onSuccess: (updatedInvoice) => {
			queryClient.setQueryData(invoiceKeys.detail(updatedInvoice.invoiceId), updatedInvoice);
			invalidateInvoiceCollections(queryClient, updatedInvoice, clientId);
		},
	});
}

export function useDeleteInvoice(clientId?: number) {
	const queryClient = useQueryClient();

	return useMutation<void, Error, { id: number; projectId?: number | null }>({
		mutationFn: ({ id }) => invoiceApi.deleteInvoice(id),
		onSuccess: (_, { id, projectId }) => {
			queryClient.removeQueries({ queryKey: invoiceKeys.detail(id) });
			invalidateInvoiceCollections(queryClient, projectId ? { invoiceId: id, projectId } : null, clientId);
		},
	});
}
