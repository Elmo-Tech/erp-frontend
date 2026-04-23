/**
 * Milestones Hooks
 * TanStack Query hooks for milestone management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { milestonesApi } from "../api/milestones";
import { Milestone, CreateMilestoneInvoicePayload } from "../types/milestone";

// Query keys
export const milestoneKeys = {
	all: ["milestones"] as const,
	details: () => [...milestoneKeys.all, "detail"] as const,
	detail: (id: number) => [...milestoneKeys.details(), id] as const,
};

/**
 * Hook to fetch a single milestone
 */
export const useMilestone = (id: number, enabled = true) => {
	return useQuery<Milestone, Error>({
		queryKey: milestoneKeys.detail(id),
		queryFn: () => milestonesApi.getById(id),
		enabled: enabled && !!id,
		staleTime: 5 * 60 * 1000,
	});
};

/**
 * Hook to create invoice from milestone
 */
export const useCreateMilestoneInvoice = () => {
	const queryClient = useQueryClient();

	return useMutation<{ invoice: unknown; milestone: Milestone }, Error, { id: number; payload?: CreateMilestoneInvoicePayload }>({
		mutationFn: ({ id, payload }) => milestonesApi.createInvoice(id, payload),
		onSuccess: (data) => {
			queryClient.setQueryData(milestoneKeys.detail(data.milestone.milestoneId), data.milestone);
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
			queryClient.invalidateQueries({ queryKey: ["contracts"] });
		},
	});
};

/**
 * Hook to link invoice to milestone
 */
export const useLinkMilestoneInvoice = () => {
	const queryClient = useQueryClient();

	return useMutation<{ milestone: Milestone }, Error, { id: number; invoiceId: number }>({
		mutationFn: ({ id, invoiceId }) => milestonesApi.linkInvoice(id, invoiceId),
		onSuccess: (data) => {
			queryClient.setQueryData(milestoneKeys.detail(data.milestone.milestoneId), data.milestone);
			queryClient.invalidateQueries({ queryKey: ["contracts"] });
		},
	});
};

/**
 * Hook to mark milestone as paid
 */
export const useMarkMilestonePaid = () => {
	const queryClient = useQueryClient();

	return useMutation<Milestone, Error, { id: number; invoiceId?: number }>({
		mutationFn: ({ id, invoiceId }) => milestonesApi.markPaid(id, invoiceId),
		onSuccess: (data) => {
			queryClient.setQueryData(milestoneKeys.detail(data.milestoneId), data);
			queryClient.invalidateQueries({ queryKey: ["contracts"] });
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
	});
};
