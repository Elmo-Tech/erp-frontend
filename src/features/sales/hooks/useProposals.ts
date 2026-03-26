"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { proposalsApi } from "../api/proposals";
import { CreateProposalPayload, UpdateProposalPayload, FastTrackProposalPayload, RejectProposalPayload, ProposalFilters } from "../types";
import { toast } from "sonner";

export const proposalKeys = {
	all: ["proposals"] as const,
	lists: () => [...proposalKeys.all, "list"] as const,
	list: (filters: ProposalFilters) => [...proposalKeys.lists(), filters] as const,
	details: () => [...proposalKeys.all, "detail"] as const,
	detail: (id: number) => [...proposalKeys.details(), id] as const,
	expiring: (days: number) => [...proposalKeys.all, "expiring", days] as const,
};

export function useProposals(filters?: ProposalFilters) {
	return useQuery({
		queryKey: proposalKeys.list(filters || {}),
		queryFn: () => proposalsApi.getAll(filters),
	});
}

export function useProposal(id: number) {
	return useQuery({
		queryKey: proposalKeys.detail(id),
		queryFn: () => proposalsApi.getById(id),
		enabled: !!id,
	});
}

export function useExpiringProposals(days: number = 3) {
	return useQuery({
		queryKey: proposalKeys.expiring(days),
		queryFn: () => proposalsApi.getExpiring(days),
	});
}

export function useCreateProposal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateProposalPayload | FormData) => proposalsApi.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: proposalKeys.all });
			toast.success("Proposal created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create proposal");
		},
	});
}

export function useUpdateProposal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateProposalPayload }) => proposalsApi.update(id, payload),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: proposalKeys.all });
			queryClient.setQueryData(proposalKeys.detail(data.proposalId), data);
			toast.success("Proposal updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update proposal");
		},
	});
}

export function useDeleteProposal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => proposalsApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: proposalKeys.all });
			toast.success("Proposal deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete proposal");
		},
	});
}

export function useUploadProposalFile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, file }: { id: number; file: File }) => proposalsApi.uploadFile(id, file),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: proposalKeys.all });
			queryClient.setQueryData(proposalKeys.detail(data.proposalId), data);
			toast.success("File uploaded successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to upload file");
		},
	});
}

export function useSendProposal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => proposalsApi.send(id),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: proposalKeys.all });
			queryClient.setQueryData(proposalKeys.detail(data.proposalId), data);
			toast.success("Proposal sent successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to send proposal");
		},
	});
}

export function useApproveProposal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => proposalsApi.approve(id),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: proposalKeys.all });
			queryClient.setQueryData(proposalKeys.detail(data.proposalId), data);
			toast.success("Proposal approved successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to approve proposal");
		},
	});
}

export function useRejectProposal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: RejectProposalPayload }) => proposalsApi.reject(id, payload),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: proposalKeys.all });
			queryClient.setQueryData(proposalKeys.detail(data.proposalId), data);
			toast.success("Proposal rejected");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to reject proposal");
		},
	});
}

export function useCreateFastTrackProposal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: FastTrackProposalPayload) => proposalsApi.createFastTrack(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: proposalKeys.all });
			toast.success("Fast track proposal created - ready for quotation");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create fast track proposal");
		},
	});
}
