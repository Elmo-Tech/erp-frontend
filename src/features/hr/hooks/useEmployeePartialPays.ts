import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeePartialPaysApi } from "../api/employee-partial-pays";
import { isValidEmployeePartialPayPeriod } from "../lib/employee-partial-pays";
import type { CreateEmployeePartialPayPayload, EmployeePartialPay, EmployeePartialPayReviewPayload } from "../types/employee-partial-pays";

export const employeePartialPayKeys = {
	all: ["employee-partial-pays"] as const,
	employees: () => [...employeePartialPayKeys.all, "employee"] as const,
	employee: (employeeId: number) => [...employeePartialPayKeys.employees(), employeeId] as const,
	list: (employeeId: number, year: number, month: number) => [...employeePartialPayKeys.employee(employeeId), year, month] as const,
};

export function useEmployeePartialPays(employeeId: number, year: number, month: number, enabled = true) {
	return useQuery({
		queryKey: employeePartialPayKeys.list(employeeId, year, month),
		queryFn: () => employeePartialPaysApi.getEmployeePartialPays(employeeId, year, month),
		enabled: enabled && employeeId > 0 && isValidEmployeePartialPayPeriod(year, month),
	});
}

export function usePreviewEmployeePartialPay() {
	return useMutation({
		mutationFn: ({ employeeId, payload }: { employeeId: number; payload: CreateEmployeePartialPayPayload }) => employeePartialPaysApi.previewEmployeePartialPay(employeeId, payload),
	});
}

export function useCreateEmployeePartialPay() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ employeeId, payload }: { employeeId: number; payload: CreateEmployeePartialPayPayload }) => employeePartialPaysApi.createEmployeePartialPay(employeeId, payload),
		onSuccess: (_, { employeeId }) => queryClient.invalidateQueries({ queryKey: employeePartialPayKeys.employee(employeeId) }),
	});
}

function useEmployeePartialPayAction(action: "approve" | "cancel") {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; employeeId: number; payload?: EmployeePartialPayReviewPayload }): Promise<EmployeePartialPay> => {
			return action === "approve" ? employeePartialPaysApi.approveEmployeePartialPay(id, payload) : employeePartialPaysApi.cancelEmployeePartialPay(id, payload);
		},
		onSuccess: (_, { employeeId }) => queryClient.invalidateQueries({ queryKey: employeePartialPayKeys.employee(employeeId) }),
	});
}

export function useApproveEmployeePartialPay() {
	return useEmployeePartialPayAction("approve");
}

export function useCancelEmployeePartialPay() {
	return useEmployeePartialPayAction("cancel");
}
