import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contractsApi } from "../api";
import { ContractFilters, CreateContractPayload, UpdateContractPayload, SignContractPayload } from "../types";

const CONTRACTS_KEY = "contracts";
const CONTRACT_KEY = "contract";
const DUE_MILESTONES_KEY = "due-milestones";

export function useContracts(filters?: ContractFilters) {
	return useQuery({
		queryKey: [CONTRACTS_KEY, filters],
		queryFn: () => contractsApi.getAll(filters),
	});
}

export function useContract(id: number) {
	return useQuery({
		queryKey: [CONTRACT_KEY, id],
		queryFn: () => contractsApi.getById(id),
		enabled: !!id,
	});
}

export function useDueMilestones() {
	return useQuery({
		queryKey: [DUE_MILESTONES_KEY],
		queryFn: () => contractsApi.getDueMilestones(),
	});
}

export function useCreateContract() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateContractPayload) => contractsApi.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [CONTRACTS_KEY] });
		},
	});
}

export function useCreateContractFromQuotation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ quotationId, payload }: { quotationId: number; payload: CreateContractPayload }) => contractsApi.createFromQuotation(quotationId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [CONTRACTS_KEY] });
			queryClient.invalidateQueries({ queryKey: ["quotations"] });
		},
	});
}

export function useUpdateContract() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateContractPayload }) => contractsApi.update(id, payload),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: [CONTRACTS_KEY] });
			queryClient.setQueryData([CONTRACT_KEY, data.contractId], data);
		},
	});
}

export function useSignContract() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: SignContractPayload }) => contractsApi.sign(id, payload),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: [CONTRACTS_KEY] });
			queryClient.setQueryData([CONTRACT_KEY, data.contractId], data);
			queryClient.invalidateQueries({ queryKey: [DUE_MILESTONES_KEY] });
		},
	});
}

export function useActivateContract() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => contractsApi.activate(id),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: [CONTRACTS_KEY] });
			queryClient.setQueryData([CONTRACT_KEY, data.contractId], data);
		},
	});
}

export function useUpdateContractStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, status }: { id: number; status: string }) => contractsApi.updateStatus(id, status),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: [CONTRACTS_KEY] });
			queryClient.setQueryData([CONTRACT_KEY, data.contractId], data);
		},
	});
}

export function useDeleteContract() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => contractsApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [CONTRACTS_KEY] });
		},
	});
}

export function useMarkMilestonePaid() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ milestoneId, invoiceId }: { milestoneId: number; invoiceId?: number }) => contractsApi.markMilestonePaid(milestoneId, invoiceId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [CONTRACTS_KEY] });
			queryClient.invalidateQueries({ queryKey: [DUE_MILESTONES_KEY] });
		},
	});
}
