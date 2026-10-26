import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveManagementApi } from "../api/leave-management";
import type { CreateEmployeeLeavePayload, CreateLeaveTypePayload, ReviewEmployeeLeavePayload, UpdateLeaveTypePayload } from "../types/leave-management";
import { refreshEmployeeHr } from "./useEmployeeOverview";

export const employeeLeaveKeys = {
	all: ["employee-leaves"] as const,
	types: () => [...employeeLeaveKeys.all, "types"] as const,
	allTypes: () => [...employeeLeaveKeys.types(), "all"] as const,
	employees: () => [...employeeLeaveKeys.all, "employee"] as const,
	employee: (employeeId: number) => [...employeeLeaveKeys.employees(), employeeId] as const,
	list: (employeeId: number, year: number) => [...employeeLeaveKeys.employee(employeeId), year] as const,
};

export function useLeaveTypes(enabled = true) {
	return useQuery({
		queryKey: employeeLeaveKeys.types(),
		queryFn: leaveManagementApi.getLeaveTypes,
		enabled,
	});
}

export function useAllLeaveTypes(enabled = true) {
	return useQuery({
		queryKey: employeeLeaveKeys.allTypes(),
		queryFn: leaveManagementApi.getAllLeaveTypes,
		enabled,
	});
}

export function useEmployeeLeaves(employeeId: number, year: number, enabled = true) {
	return useQuery({
		queryKey: employeeLeaveKeys.list(employeeId, year),
		queryFn: () => leaveManagementApi.getEmployeeLeaves(employeeId, year),
		enabled: enabled && employeeId > 0,
	});
}

export function useCreateEmployeeLeave() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ employeeId, payload }: { employeeId: number; payload: CreateEmployeeLeavePayload }) => leaveManagementApi.createEmployeeLeave(employeeId, payload),
		onSuccess: (_, { employeeId }) => Promise.all([queryClient.invalidateQueries({ queryKey: employeeLeaveKeys.employee(employeeId) }), refreshEmployeeHr(queryClient, employeeId)]),
	});
}

export function useUpdateEmployeeLeave() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; employeeId: number; payload: CreateEmployeeLeavePayload }) => leaveManagementApi.updateEmployeeLeave(id, payload),
		onSuccess: (_, { employeeId }) => Promise.all([queryClient.invalidateQueries({ queryKey: employeeLeaveKeys.employee(employeeId) }), refreshEmployeeHr(queryClient, employeeId)]),
	});
}

export function useCreateLeaveType() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateLeaveTypePayload) => leaveManagementApi.createLeaveType(payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeLeaveKeys.all }),
	});
}

export function useUpdateLeaveType() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateLeaveTypePayload }) => leaveManagementApi.updateLeaveType(id, payload),
		onSuccess: () => Promise.all([queryClient.invalidateQueries({ queryKey: employeeLeaveKeys.all }), queryClient.invalidateQueries({ queryKey: ["employee-overview"] })]),
	});
}

function useEmployeeLeaveAction(action: "approve" | "reject" | "cancel") {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; employeeId: number; payload?: ReviewEmployeeLeavePayload }) => {
			if (action === "approve") return leaveManagementApi.approveEmployeeLeave(id, payload);
			if (action === "reject") return leaveManagementApi.rejectEmployeeLeave(id, payload);
			return leaveManagementApi.cancelEmployeeLeave(id, payload);
		},
		onSuccess: (_, { employeeId }) => Promise.all([queryClient.invalidateQueries({ queryKey: employeeLeaveKeys.employee(employeeId) }), refreshEmployeeHr(queryClient, employeeId)]),
	});
}

export function useApproveEmployeeLeave() {
	return useEmployeeLeaveAction("approve");
}

export function useRejectEmployeeLeave() {
	return useEmployeeLeaveAction("reject");
}

export function useCancelEmployeeLeave() {
	return useEmployeeLeaveAction("cancel");
}
