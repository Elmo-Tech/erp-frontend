import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeAdvancesApi } from "../api/employee-advances";
import { isValidEmployeeAdvancePeriod } from "../lib/employee-advances";
import type { ApproveEmployeeAdvancePayload, CreateEmployeeAdvancePayload, DisburseEmployeeAdvancePayload, EmployeeAdvance, EmployeeAdvanceReviewPayload, SettleEmployeeAdvanceSettlementPayload } from "../types/employee-advances";

export const employeeAdvanceKeys = {
	all: ["employee-advances"] as const,
	employees: () => [...employeeAdvanceKeys.all, "employee"] as const,
	employee: (employeeId: number) => [...employeeAdvanceKeys.employees(), employeeId] as const,
	list: (employeeId: number, year: number, month: number) => [...employeeAdvanceKeys.employee(employeeId), year, month] as const,
	details: () => [...employeeAdvanceKeys.all, "detail"] as const,
	detail: (id: number) => [...employeeAdvanceKeys.details(), id] as const,
};

export function useEmployeeAdvances(employeeId: number, year: number, month: number, enabled = true) {
	return useQuery({
		queryKey: employeeAdvanceKeys.list(employeeId, year, month),
		queryFn: () => employeeAdvancesApi.getEmployeeAdvances(employeeId, year, month),
		enabled: enabled && employeeId > 0 && isValidEmployeeAdvancePeriod(year, month),
	});
}

export function useEmployeeAdvance(id: number, enabled = true) {
	return useQuery({
		queryKey: employeeAdvanceKeys.detail(id),
		queryFn: () => employeeAdvancesApi.getEmployeeAdvance(id),
		enabled: enabled && id > 0,
	});
}

function useEmployeeAdvanceMutation<TPayload>(mutationFn: (id: number, payload?: TPayload) => Promise<EmployeeAdvance>) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; employeeId: number; payload?: TPayload }) => mutationFn(id, payload),
		onSuccess: (_, { id, employeeId }) => Promise.all([
			queryClient.invalidateQueries({ queryKey: employeeAdvanceKeys.employee(employeeId) }),
			queryClient.invalidateQueries({ queryKey: employeeAdvanceKeys.detail(id) }),
		]),
	});
}

export function useCreateEmployeeAdvance() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ employeeId, payload }: { employeeId: number; payload: CreateEmployeeAdvancePayload }) => employeeAdvancesApi.createEmployeeAdvance(employeeId, payload),
		onSuccess: (_, { employeeId }) => queryClient.invalidateQueries({ queryKey: employeeAdvanceKeys.employee(employeeId) }),
	});
}

export function useApproveEmployeeAdvance() {
	return useEmployeeAdvanceMutation<ApproveEmployeeAdvancePayload>(employeeAdvancesApi.approveEmployeeAdvance);
}

export function useRejectEmployeeAdvance() {
	return useEmployeeAdvanceMutation<EmployeeAdvanceReviewPayload>(employeeAdvancesApi.rejectEmployeeAdvance);
}

export function useCancelEmployeeAdvance() {
	return useEmployeeAdvanceMutation<EmployeeAdvanceReviewPayload>(employeeAdvancesApi.cancelEmployeeAdvance);
}

export function useDisburseEmployeeAdvance() {
	return useEmployeeAdvanceMutation<DisburseEmployeeAdvancePayload>(employeeAdvancesApi.disburseEmployeeAdvance);
}

export function useSettleEmployeeAdvanceSettlement() {
	return useEmployeeAdvanceMutation<SettleEmployeeAdvanceSettlementPayload>(employeeAdvancesApi.settleEmployeeAdvanceSettlement);
}
