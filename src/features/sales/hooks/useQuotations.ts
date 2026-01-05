import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationsApi } from "../api";
import { QuotationFilters, CreateQuotationPayload, UpdateQuotationPayload, UpdateStatusPayload } from "../types";

const QUOTATIONS_KEY = "quotations";
const QUOTATION_KEY = "quotation";
const EXPIRING_KEY = "quotations-expiring";
const OVERDUE_KEY = "quotations-overdue";

export function useQuotations(filters?: QuotationFilters) {
	return useQuery({
		queryKey: [QUOTATIONS_KEY, filters],
		queryFn: () => quotationsApi.getAll(filters),
	});
}

export function useQuotation(id: number) {
	return useQuery({
		queryKey: [QUOTATION_KEY, id],
		queryFn: () => quotationsApi.getById(id),
		enabled: !!id,
	});
}

export function useExpiringQuotations(days: number = 3) {
	return useQuery({
		queryKey: [EXPIRING_KEY, days],
		queryFn: () => quotationsApi.getExpiring(days),
	});
}

export function useOverdueQuotations() {
	return useQuery({
		queryKey: [OVERDUE_KEY],
		queryFn: () => quotationsApi.getOverdue(),
	});
}

export function useCreateQuotation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateQuotationPayload) => quotationsApi.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] });
		},
	});
}

export function useUpdateQuotation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateQuotationPayload }) => quotationsApi.update(id, payload),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] });
			queryClient.setQueryData([QUOTATION_KEY, data.quotationId], data);
		},
	});
}

export function useUpdateQuotationStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateStatusPayload }) => quotationsApi.updateStatus(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] });
			queryClient.invalidateQueries({ queryKey: [EXPIRING_KEY] });
			queryClient.invalidateQueries({ queryKey: [OVERDUE_KEY] });
		},
	});
}

export function useSendQuotation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => quotationsApi.send(id),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] });
			queryClient.setQueryData([QUOTATION_KEY, data.quotationId], data);
		},
	});
}

export function useDeleteQuotation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => quotationsApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] });
		},
	});
}
