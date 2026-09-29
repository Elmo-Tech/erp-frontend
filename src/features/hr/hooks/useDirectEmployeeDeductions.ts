import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { directEmployeeDeductionsApi } from "../api/direct-employee-deductions";
import { isValidDirectDeductionPeriod } from "../lib/direct-employee-deductions";
import type { CreateDirectEmployeeDeductionPayload, DirectEmployeeDeductionReviewPayload, RejectDirectEmployeeDeductionPayload } from "../types/direct-employee-deductions";

export const directEmployeeDeductionKeys = {
	all: ["direct-employee-deductions"] as const,
	types: () => [...directEmployeeDeductionKeys.all, "types"] as const,
	employees: () => [...directEmployeeDeductionKeys.all, "employee"] as const,
	employee: (employeeId: number) => [...directEmployeeDeductionKeys.employees(), employeeId] as const,
	list: (employeeId: number, year: number, month: number) => [...directEmployeeDeductionKeys.employee(employeeId), year, month] as const,
};

export function useActiveDirectDeductionTypes(enabled = true) {
	return useQuery({
		queryKey: directEmployeeDeductionKeys.types(),
		queryFn: directEmployeeDeductionsApi.getActiveDeductionTypes,
		enabled,
	});
}

export function useEmployeeDirectDeductions(employeeId: number, year: number, month: number, enabled = true) {
	return useQuery({
		queryKey: directEmployeeDeductionKeys.list(employeeId, year, month),
		queryFn: () => directEmployeeDeductionsApi.getEmployeeDirectDeductions(employeeId, year, month),
		enabled: enabled && employeeId > 0 && isValidDirectDeductionPeriod(year, month),
	});
}

export function useCreateEmployeeDirectDeduction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ employeeId, payload }: { employeeId: number; payload: CreateDirectEmployeeDeductionPayload }) => directEmployeeDeductionsApi.createEmployeeDirectDeduction(employeeId, payload),
		onSuccess: (_, { employeeId }) => queryClient.invalidateQueries({ queryKey: directEmployeeDeductionKeys.employee(employeeId) }),
	});
}

function useEmployeeDirectDeductionAction(action: "approve" | "cancel") {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, employeeId, payload }: { id: number; employeeId: number; payload?: DirectEmployeeDeductionReviewPayload }) => {
			if (action === "approve") return directEmployeeDeductionsApi.approveEmployeeDirectDeduction(id, payload);
			return directEmployeeDeductionsApi.cancelEmployeeDirectDeduction(id, payload);
		},
		onSuccess: (_, { employeeId }) => queryClient.invalidateQueries({ queryKey: directEmployeeDeductionKeys.employee(employeeId) }),
	});
}

export function useApproveEmployeeDirectDeduction() {
	return useEmployeeDirectDeductionAction("approve");
}

export function useCancelEmployeeDirectDeduction() {
	return useEmployeeDirectDeductionAction("cancel");
}

export function useRejectEmployeeDirectDeduction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, employeeId, payload }: { id: number; employeeId: number; payload: RejectDirectEmployeeDeductionPayload }) => directEmployeeDeductionsApi.rejectEmployeeDirectDeduction(id, payload),
		onSuccess: (_, { employeeId }) => queryClient.invalidateQueries({ queryKey: directEmployeeDeductionKeys.employee(employeeId) }),
	});
}
