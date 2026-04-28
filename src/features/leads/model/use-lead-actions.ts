"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leadApi } from "@/entities/lead/api/lead.api";
import { leadKeys } from "@/entities/lead/model/query-keys";
import type { Lead, LeadFilters, CreateLeadPayload, UpdateLeadPayload, ConvertLeadPayload } from "@/entities/lead/model/types";

export function useLeads(filters?: LeadFilters) {
	return useQuery({
		queryKey: leadKeys.list(filters),
		queryFn: () => leadApi.getLeads(filters),
	});
}

export function useLead(id: number) {
	return useQuery({
		queryKey: leadKeys.detail(id),
		queryFn: () => leadApi.getLeadById(id),
		enabled: !!id,
	});
}

export function useLeadsKanban() {
	return useQuery({
		queryKey: leadKeys.kanban(),
		queryFn: () => leadApi.getLeadsKanban(),
	});
}

export function useLeadsFollowUps() {
	return useQuery({
		queryKey: leadKeys.followUps(),
		queryFn: () => leadApi.getFollowUps(),
	});
}

export function useCreateLead() {
	const queryClient = useQueryClient();
	return useMutation<Lead, Error, CreateLeadPayload>({
		mutationFn: leadApi.createLead,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
			queryClient.invalidateQueries({ queryKey: leadKeys.kanban() });
		},
	});
}

export function useUpdateLead() {
	const queryClient = useQueryClient();
	return useMutation<Lead, Error, { id: number; payload: UpdateLeadPayload }>({
		mutationFn: ({ id, payload }) => leadApi.updateLead(id, payload),
		onSuccess: (data, { id }) => {
			queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
			queryClient.invalidateQueries({ queryKey: leadKeys.kanban() });
			queryClient.setQueryData(leadKeys.detail(id), data);
		},
	});
}

export function useUpdateLeadStatus() {
	const queryClient = useQueryClient();
	return useMutation<Lead, Error, { id: number; status: Lead["status"] }>({
		mutationFn: ({ id, status }) => leadApi.updateLeadStatus(id, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
			queryClient.invalidateQueries({ queryKey: leadKeys.kanban() });
		},
	});
}

export function useDeleteLead() {
	const queryClient = useQueryClient();
	return useMutation<void, Error, number>({
		mutationFn: leadApi.deleteLead,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
			queryClient.invalidateQueries({ queryKey: leadKeys.kanban() });
		},
	});
}

export function useCanConvertLead(leadId: number) {
	return useQuery({
		queryKey: [...leadKeys.all, "can-convert", leadId] as const,
		queryFn: () => leadApi.canConvertLead(leadId),
		enabled: !!leadId,
	});
}

export function useConvertLead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ leadId, payload }: { leadId: number; payload?: ConvertLeadPayload }) => leadApi.convertLead(leadId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
			queryClient.invalidateQueries({ queryKey: leadKeys.kanban() });
			queryClient.invalidateQueries({ queryKey: ["clients"] });
		},
	});
}
