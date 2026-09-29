import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employmentContractsApi } from "../api/employment-contracts";
import type { EmploymentContractPayload } from "../types/employment-contract";

export const employmentContractKeys = {
	all: ["employment-contracts"] as const,
	lists: () => [...employmentContractKeys.all, "list"] as const,
	list: (employeeId: number) => [...employmentContractKeys.lists(), employeeId] as const,
};

export function useEmploymentContracts(employeeId: number, enabled = true) {
	return useQuery({
		queryKey: employmentContractKeys.list(employeeId),
		queryFn: () => employmentContractsApi.getAll(employeeId),
		enabled: enabled && employeeId > 0,
	});
}

export function useCreateEmploymentContract() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ employeeId, payload }: { employeeId: number; payload: EmploymentContractPayload }) => employmentContractsApi.create(employeeId, payload),
		onSuccess: (_, { employeeId }) => {
			queryClient.invalidateQueries({ queryKey: employmentContractKeys.list(employeeId) });
		},
	});
}

export function useUpdateEmploymentContract() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; employeeId: number; payload: EmploymentContractPayload }) => employmentContractsApi.update(id, payload),
		onSuccess: (_, { employeeId }) => {
			queryClient.invalidateQueries({ queryKey: employmentContractKeys.list(employeeId) });
		},
	});
}
