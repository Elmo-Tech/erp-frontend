import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shortPermissionsApi } from "../api/short-permissions";
import { isValidPermissionMonth } from "../lib/short-permissions";
import type { ApproveEmployeeShortPermissionPayload, CreateEmployeeShortPermissionPayload, ReviewEmployeeShortPermissionPayload } from "../types/short-permissions";
import { useAuthStore } from "@/store/authStore";
import { refreshEmployeeHr } from "./useEmployeeOverview";

export const employeeShortPermissionKeys = {
	all: ["employee-short-permissions"] as const,
	pending: () => [...employeeShortPermissionKeys.all, "pending"] as const,
	employees: () => [...employeeShortPermissionKeys.all, "employee"] as const,
	employee: (employeeId: number) => [...employeeShortPermissionKeys.employees(), employeeId] as const,
	list: (employeeId: number, month: string) => [...employeeShortPermissionKeys.employee(employeeId), month] as const,
};

export function usePendingEmployeeShortPermissions(enabled = true) {
	const reviewerId = useAuthStore((state) => state.user?.userId);
	return useQuery({
		queryKey: [...employeeShortPermissionKeys.pending(), reviewerId],
		queryFn: shortPermissionsApi.getPendingShortPermissions,
		enabled,
		refetchInterval: enabled ? 15_000 : false,
	});
}

function refreshShortPermissions(queryClient: QueryClient, employeeId: number) {
	return Promise.all([
		queryClient.invalidateQueries({ queryKey: employeeShortPermissionKeys.employee(employeeId) }),
		queryClient.invalidateQueries({ queryKey: employeeShortPermissionKeys.pending() }),
		refreshEmployeeHr(queryClient, employeeId),
	]);
}

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
		onSuccess: (_, { employeeId }) => refreshShortPermissions(queryClient, employeeId),
	});
}

export function useUpdateEmployeeShortPermission() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; employeeId: number; payload: CreateEmployeeShortPermissionPayload }) => shortPermissionsApi.updateEmployeeShortPermission(id, payload),
		onSuccess: (_, { employeeId }) => refreshShortPermissions(queryClient, employeeId),
	});
}

export function useApproveEmployeeShortPermission() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; employeeId: number; payload: ApproveEmployeeShortPermissionPayload }) => shortPermissionsApi.approveEmployeeShortPermission(id, payload),
		onSuccess: (_, { employeeId }) => refreshShortPermissions(queryClient, employeeId),
	});
}

function useEmployeeShortPermissionReviewAction(action: "reject" | "cancel") {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; employeeId: number; payload?: ReviewEmployeeShortPermissionPayload }) => {
			if (action === "reject") return shortPermissionsApi.rejectEmployeeShortPermission(id, payload);
			return shortPermissionsApi.cancelEmployeeShortPermission(id, payload);
		},
		onSuccess: (_, { employeeId }) => refreshShortPermissions(queryClient, employeeId),
	});
}

export function useRejectEmployeeShortPermission() {
	return useEmployeeShortPermissionReviewAction("reject");
}

export function useCancelEmployeeShortPermission() {
	return useEmployeeShortPermissionReviewAction("cancel");
}
