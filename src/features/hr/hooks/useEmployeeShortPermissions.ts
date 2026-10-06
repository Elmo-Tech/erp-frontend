import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shortPermissionsApi } from "../api/short-permissions";
import { isValidPermissionMonth } from "../lib/short-permissions";
import type { ApproveEmployeeShortPermissionPayload, CreateEmployeeShortPermissionPayload, ReviewEmployeeShortPermissionPayload } from "../types/short-permissions";

export const employeeShortPermissionKeys = {
	all: ["employee-short-permissions"] as const,
	employees: () => [...employeeShortPermissionKeys.all, "employee"] as const,
	employee: (employeeId: number) => [...employeeShortPermissionKeys.employees(), employeeId] as const,
	list: (employeeId: number, month: string) => [...employeeShortPermissionKeys.employee(employeeId), month] as const,
};

export function useEmployeeShortPermissions(employeeId: number, month: string, enabled = true) {
	return useQuery({
		queryKey: employeeShortPermissionKeys.list(employeeId, month),
		queryFn: () => shortPermissionsApi.getEmployeeShortPermissions(employeeId, month),
		enabled: enabled && employeeId > 0 && isValidPermissionMonth(month),
	});
}

export function useCreateEmployeeShortPermission() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ employeeId, payload }: { employeeId: number; payload: CreateEmployeeShortPermissionPayload }) => shortPermissionsApi.createEmployeeShortPermission(employeeId, payload),
		onSuccess: (_, { employeeId }) => queryClient.invalidateQueries({ queryKey: employeeShortPermissionKeys.employee(employeeId) }),
	});
}

export function useUpdateEmployeeShortPermission() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, employeeId, payload }: { id: number; employeeId: number; payload: CreateEmployeeShortPermissionPayload }) => shortPermissionsApi.updateEmployeeShortPermission(id, payload),
		onSuccess: (_, { employeeId }) => queryClient.invalidateQueries({ queryKey: employeeShortPermissionKeys.employee(employeeId) }),
	});
}

export function useApproveEmployeeShortPermission() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, employeeId, payload }: { id: number; employeeId: number; payload: ApproveEmployeeShortPermissionPayload }) => shortPermissionsApi.approveEmployeeShortPermission(id, payload),
		onSuccess: (_, { employeeId }) => queryClient.invalidateQueries({ queryKey: employeeShortPermissionKeys.employee(employeeId) }),
	});
}

function useEmployeeShortPermissionReviewAction(action: "reject" | "cancel") {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, employeeId, payload }: { id: number; employeeId: number; payload?: ReviewEmployeeShortPermissionPayload }) => {
			if (action === "reject") return shortPermissionsApi.rejectEmployeeShortPermission(id, payload);
			return shortPermissionsApi.cancelEmployeeShortPermission(id, payload);
		},
		onSuccess: (_, { employeeId }) => queryClient.invalidateQueries({ queryKey: employeeShortPermissionKeys.employee(employeeId) }),
	});
}

export function useRejectEmployeeShortPermission() {
	return useEmployeeShortPermissionReviewAction("reject");
}

export function useCancelEmployeeShortPermission() {
	return useEmployeeShortPermissionReviewAction("cancel");
}
