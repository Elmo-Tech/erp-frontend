import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoicesApi } from "../api";
import { Invoice, CreateInvoicePayload, UpdateInvoicePayload, InvoiceListResponse, InvoiceFilters } from "../types";
import { clientKeys } from "@/features/clients/hooks/useClients";

export const invoiceKeys = {
	all: ["invoices"] as const,
	lists: () => [...invoiceKeys.all, "list"] as const,
	list: (filters?: InvoiceFilters) => [...invoiceKeys.lists(), filters] as const,
	details: () => [...invoiceKeys.all, "detail"] as const,
	detail: (id: number) => [...invoiceKeys.details(), id] as const,
};

export const useInvoices = (filters?: InvoiceFilters) => {
	return useQuery<InvoiceListResponse, Error>({
		queryKey: invoiceKeys.list(filters),
		queryFn: () => invoicesApi.getAll(filters),
		staleTime: 5 * 60 * 1000,
	});
};

export const useInvoice = (id: number, enabled = true) => {
	return useQuery<Invoice, Error>({
		queryKey: invoiceKeys.detail(id),
		queryFn: () => invoicesApi.getById(id),
		enabled: enabled && !!id,
		staleTime: 5 * 60 * 1000,
	});
};

export const useCreateInvoice = (clientId?: number) => {
	const queryClient = useQueryClient();

	return useMutation<Invoice, Error, CreateInvoicePayload>({
		mutationFn: invoicesApi.create,
		onSuccess: (newInvoice) => {
			queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
			queryClient.setQueryData(invoiceKeys.detail(newInvoice.invoiceId), newInvoice);

			// Invalidate client details to refresh invoices list
			if (clientId) {
				queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });
			}
		},
	});
};

export const useUpdateInvoice = () => {
	const queryClient = useQueryClient();

	return useMutation<Invoice, Error, { id: number; payload: UpdateInvoicePayload }>({
		mutationFn: ({ id, payload }) => invoicesApi.update(id, payload),
		onSuccess: (updatedInvoice) => {
			queryClient.setQueryData(invoiceKeys.detail(updatedInvoice.invoiceId), updatedInvoice);
			queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
		},
	});
};

export const useMarkInvoiceAsPaid = () => {
	const queryClient = useQueryClient();

	return useMutation<Invoice, Error, number>({
		mutationFn: invoicesApi.markAsPaid,
		onSuccess: (updatedInvoice) => {
			queryClient.setQueryData(invoiceKeys.detail(updatedInvoice.invoiceId), updatedInvoice);
			queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
		},
	});
};

export const useDeleteInvoice = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: invoicesApi.delete,
		onSuccess: (_, deletedId) => {
			queryClient.removeQueries({ queryKey: invoiceKeys.detail(deletedId) });
			queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
		},
	});
};
