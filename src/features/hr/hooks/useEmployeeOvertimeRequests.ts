import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { overtimeRequestsApi } from "../api/overtime-requests";
import { isValidOvertimePeriod } from "../lib/overtime-requests";
import type { CreateEmployeeOvertimeRequestPayload, ReviewEmployeeOvertimeRequestPayload } from "../types/overtime-requests";
import { refreshEmployeeHr } from "./useEmployeeOverview";

export const employeeOvertimeRequestKeys = {
	all: ["employee-overtime-requests"] as const,
	employees: () => [...employeeOvertimeRequestKeys.all, "employee"] as const,
	employee: (employeeId: number) => [...employeeOvertimeRequestKeys.employees(), employeeId] as const,
	list: (employeeId: number, year: number, month: number) => [...employeeOvertimeRequestKeys.employee(employeeId), year, month] as const,
};

export function useEmployeeOvertimeRequests(employeeId: number, year: number, month: number, enabled = true) {
	return useQuery({
		queryKey: employeeOvertimeRequestKeys.list(employeeId, year, month),
		queryFn: () => overtimeRequestsApi.getEmployeeOvertimeRequests(employeeId, year, month),
		enabled: enabled && employeeId > 0 && isValidOvertimePeriod(year, month),
	});
}

export function useCreateEmployeeOvertimeRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ employeeId, payload }: { employeeId: number; payload: CreateEmployeeOvertimeRequestPayload }) => overtimeRequestsApi.createEmployeeOvertimeRequest(employeeId, payload),
		onSuccess: (_, { employeeId }) => Promise.all([queryClient.invalidateQueries({ queryKey: employeeOvertimeRequestKeys.employee(employeeId) }), refreshEmployeeHr(queryClient, employeeId)]),
	});
}

function useEmployeeOvertimeRequestAction(action: "approve" | "reject" | "cancel") {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; employeeId: number; payload?: ReviewEmployeeOvertimeRequestPayload }) => {
			if (action === "approve") return overtimeRequestsApi.approveEmployeeOvertimeRequest(id, payload);
			if (action === "reject") return overtimeRequestsApi.rejectEmployeeOvertimeRequest(id, payload);
			return overtimeRequestsApi.cancelEmployeeOvertimeRequest(id, payload);
		},
		onSuccess: (_, { employeeId }) => Promise.all([queryClient.invalidateQueries({ queryKey: employeeOvertimeRequestKeys.employee(employeeId) }), refreshEmployeeHr(queryClient, employeeId)]),
	});
}

export function useApproveEmployeeOvertimeRequest() {
	return useEmployeeOvertimeRequestAction("approve");
}

export function useRejectEmployeeOvertimeRequest() {
	return useEmployeeOvertimeRequestAction("reject");
}

export function useCancelEmployeeOvertimeRequest() {
	return useEmployeeOvertimeRequestAction("cancel");
}
