import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "../api";
import type { EmployeeFilters, CreateEmployeePayload, UpdateEmployeePayload } from "../types";

export const employeeKeys = {
	all: ["employees"] as const,
	lists: () => [...employeeKeys.all, "list"] as const,
	list: (filters?: EmployeeFilters) => [...employeeKeys.lists(), filters] as const,
	details: () => [...employeeKeys.all, "detail"] as const,
	detail: (id: number) => [...employeeKeys.details(), id] as const,
	performance: (id: number, year?: number, month?: number) => [...employeeKeys.all, "performance", id, year, month] as const,
};

export function useEmployees(filters?: EmployeeFilters, enabled = true) {
	return useQuery({
		queryKey: employeeKeys.list(filters),
		queryFn: () => employeesApi.getAll(filters),
		enabled,
	});
}

export function useEmployee(id: number, enabled = true) {
	return useQuery({
		queryKey: employeeKeys.detail(id),
		queryFn: () => employeesApi.getById(id),
		enabled: enabled && id > 0,
	});
}

export function useEmployeePerformance(id: number, year?: number, month?: number, enabled = true) {
	return useQuery({
		queryKey: employeeKeys.performance(id, year, month),
		queryFn: () => employeesApi.getPerformance(id, year, month),
		enabled: enabled && id > 0,
	});
}

export function useCreateEmployee() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateEmployeePayload) => employeesApi.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
		},
	});
}

export function useUpdateEmployee() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateEmployeePayload }) => employeesApi.update(id, payload),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
			queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
		},
	});
}

export function useUploadEmployeeAvatar() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, avatar }: { id: number; avatar: File }) => employeesApi.uploadAvatar(id, avatar),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
			queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
		},
	});
}

export function useDeactivateEmployee() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => employeesApi.deactivate(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
			queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
		},
	});
}

export function useActivateEmployee() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => employeesApi.activate(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
			queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
		},
	});
}

export function useDeleteEmployee() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => employeesApi.remove(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
			queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
		},
	});
}
