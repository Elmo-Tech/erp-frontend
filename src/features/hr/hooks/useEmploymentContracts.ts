import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employmentContractsApi } from "../api/employment-contracts";
import type { EmploymentContractPayload } from "../types/employment-contract";
import { employeeKeys } from "./useEmployees";
import { refreshEmployeeHr } from "./useEmployeeOverview";

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
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
			void refreshEmployeeHr(queryClient, employeeId);
		},
	});
}

export function useUpdateEmploymentContract() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; employeeId: number; payload: EmploymentContractPayload }) => employmentContractsApi.update(id, payload),
		onSuccess: (_, { employeeId }) => {
			queryClient.invalidateQueries({ queryKey: employmentContractKeys.list(employeeId) });
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
			void refreshEmployeeHr(queryClient, employeeId);
		},
	});
}

export function useDeleteEmploymentContract() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: number; employeeId: number }) => employmentContractsApi.remove(id),
		onSuccess: (_, { employeeId }) => {
			queryClient.invalidateQueries({ queryKey: employmentContractKeys.list(employeeId) });
		},
	});
}

export function useUploadContractFile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, file }: { id: number; employeeId: number; file: File }) => employmentContractsApi.uploadFile(id, file),
		onSuccess: (_, { employeeId }) => {
			queryClient.invalidateQueries({ queryKey: employmentContractKeys.list(employeeId) });
		},
	});
}

export function useDeleteContractFile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: number; employeeId: number }) => employmentContractsApi.deleteFile(id),
		onSuccess: (_, { employeeId }) => {
			queryClient.invalidateQueries({ queryKey: employmentContractKeys.list(employeeId) });
		},
	});
}
