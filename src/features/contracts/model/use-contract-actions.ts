"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contractApi } from "@/entities/contract/api/contract.api";
import { contractKeys } from "@/entities/contract/model/query-keys";
import type { Contract, ContractFilters, CreateContractPayload, UpdateContractPayload, SignContractPayload } from "@/entities/contract/model/types";

export function useContracts(filters?: ContractFilters) {
	return useQuery({
		queryKey: contractKeys.list(filters),
		queryFn: () => contractApi.getContracts(filters),
	});
}

export function useContract(id: number) {
	return useQuery({
		queryKey: contractKeys.detail(id),
		queryFn: () => contractApi.getContractById(id),
		enabled: !!id,
	});
}

export function useDueMilestones() {
	return useQuery({
		queryKey: contractKeys.dueMilestones(),
		queryFn: () => contractApi.getDueMilestones(),
	});
}

export function useCreateContract() {
	const queryClient = useQueryClient();
	return useMutation<Contract, Error, CreateContractPayload>({
		mutationFn: contractApi.createContract,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
		},
	});
}

export function useUpdateContract() {
	const queryClient = useQueryClient();
	return useMutation<Contract, Error, { id: number; payload: UpdateContractPayload }>({
		mutationFn: ({ id, payload }) => contractApi.updateContract(id, payload),
		onSuccess: (data, { id }) => {
			queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
			queryClient.setQueryData(contractKeys.detail(id), data);
		},
	});
}

export function useSignContract() {
	const queryClient = useQueryClient();
	return useMutation<Contract, Error, { id: number; payload: SignContractPayload }>({
		mutationFn: ({ id, payload }) => contractApi.signContract(id, payload),
		onSuccess: (data, { id }) => {
			queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
			queryClient.setQueryData(contractKeys.detail(id), data);
			queryClient.invalidateQueries({ queryKey: contractKeys.dueMilestones() });
		},
	});
}

export function useActivateContract() {
	const queryClient = useQueryClient();
	return useMutation<Contract, Error, number>({
		mutationFn: contractApi.activateContract,
		onSuccess: (data, id) => {
			queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
			queryClient.setQueryData(contractKeys.detail(id), data);
		},
	});
}

export function useDeleteContract() {
	const queryClient = useQueryClient();
	return useMutation<void, Error, number>({
		mutationFn: contractApi.deleteContract,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
		},
	});
}

export function useMarkMilestonePaid() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ milestoneId, invoiceId }: { milestoneId: number; invoiceId?: number }) => contractApi.markMilestonePaid(milestoneId, invoiceId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: contractKeys.all });
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
	});
}
