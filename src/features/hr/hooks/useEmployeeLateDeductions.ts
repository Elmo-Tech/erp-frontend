import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lateDeductionsApi } from "../api/late-deductions";
import { isValidLateDeductionPeriod } from "../lib/late-deductions";
import type { OverrideLateDeductionPayload } from "../types/late-deductions";

export const employeeLateDeductionKeys = {
	all: ["employee-late-deductions"] as const,
	employees: () => [...employeeLateDeductionKeys.all, "employee"] as const,
	employee: (employeeId: number) => [...employeeLateDeductionKeys.employees(), employeeId] as const,
	list: (employeeId: number, year: number, month: number) => [...employeeLateDeductionKeys.employee(employeeId), year, month] as const,
};

export function useEmployeeLateDeductions(employeeId: number, year: number, month: number, enabled = true) {
	return useQuery({
		queryKey: employeeLateDeductionKeys.list(employeeId, year, month),
		queryFn: () => lateDeductionsApi.getEmployeeLateDeductions(employeeId, year, month),
		enabled: enabled && employeeId > 0 && isValidLateDeductionPeriod(year, month),
	});
}

export function useEvaluateEmployeeLateDeductions() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ employeeId, year, month }: { employeeId: number; year: number; month: number }) => lateDeductionsApi.evaluateEmployeeLateDeductions(employeeId, year, month),
		onSuccess: (_, { employeeId }) => queryClient.invalidateQueries({ queryKey: employeeLateDeductionKeys.employee(employeeId) }),
	});
}

export function useOverrideLateDeduction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, employeeId, payload }: { id: number; employeeId: number; payload: OverrideLateDeductionPayload }) => lateDeductionsApi.overrideLateDeduction(id, payload),
		onSuccess: (_, { employeeId }) => queryClient.invalidateQueries({ queryKey: employeeLateDeductionKeys.employee(employeeId) }),
	});
}
