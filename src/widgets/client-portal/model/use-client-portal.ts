"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientPortalApi, type ClientListFilters } from "./client-portal.api";

export function useClientPortalProjects(filters?: ClientListFilters) {
	return useQuery({
		queryKey: ["client-portal", "projects", filters],
		queryFn: () => clientPortalApi.getProjects(filters),
	});
}

export function useClientPortalProject(projectId: number) {
	return useQuery({
		queryKey: ["client-portal", "project", projectId],
		queryFn: () => clientPortalApi.getProject(projectId),
		enabled: Number.isFinite(projectId) && projectId > 0,
	});
}

export function useClientPortalInvoices(filters?: ClientListFilters) {
	return useQuery({
		queryKey: ["client-portal", "invoices", filters],
		queryFn: () => clientPortalApi.getInvoices(filters),
	});
}

export function usePayClientInvoice() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: clientPortalApi.payInvoice,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["client-portal", "invoices"] });
		},
	});
}

export function useApproveClientProjectUi() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: clientPortalApi.approveProjectUi,
		onSuccess: (_, projectId) => {
			queryClient.invalidateQueries({ queryKey: ["client-portal", "projects"] });
			queryClient.invalidateQueries({ queryKey: ["client-portal", "project", projectId] });
		},
	});
}
