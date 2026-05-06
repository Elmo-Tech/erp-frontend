/**
 * features/hr/model/use-hr-actions.ts
 *
 * All React Query hooks (queries + mutations) for the HR domain.
 * Imports raw fetchers from entities/hr/api/hr.api.ts.
 * Follows the same pattern as features/clients/model/use-client-actions.ts.
 *
 * Mutation hooks MUST call queryClient.invalidateQueries on success (No Refresh Rule).
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hrKeys, hrAdminKeys } from "@/entities/hr/model/query-keys";
import * as hrApi from "@/entities/hr/api/hr.api";
import type { CreateShiftPayload, UpdateShiftPayload, CreateEmployeeProfilePayload, UpdateEmployeeProfilePayload, GeneratePayrollPayload, UpdateSystemSettingPayload } from "@/entities/hr/model/types";

// ═════════════════════════════════════════════════════════════════════════════
// EMPLOYEE PORTAL — Queries & Mutations
// ═════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Points
// ─────────────────────────────────────────────────────────────────────────────

export function useMyPoints() {
	return useQuery({
		queryKey: hrKeys.points(),
		queryFn: hrApi.fetchMyPoints,
		staleTime: 2 * 60 * 1000,
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Attendance
// ─────────────────────────────────────────────────────────────────────────────

export function useMyAttendance() {
	return useQuery({
		queryKey: hrKeys.attendanceList(),
		queryFn: hrApi.fetchAttendanceList,
		staleTime: 2 * 60 * 1000,
	});
}

export function useTodayAttendance() {
	return useQuery({
		queryKey: hrKeys.attendanceToday(),
		queryFn: hrApi.fetchTodayAttendance,
		staleTime: 60 * 1000,
		refetchInterval: 60 * 1000,
	});
}

export function useCheckOutMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: hrApi.postCheckOut,
		onSuccess: () => {
			// Invalidate both today's record and the historical list
			queryClient.invalidateQueries({ queryKey: hrKeys.attendance() });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Payslips
// ─────────────────────────────────────────────────────────────────────────────

export function useMyPayslips() {
	return useQuery({
		queryKey: hrKeys.payslipList(),
		queryFn: hrApi.fetchMyPayslips,
		staleTime: 5 * 60 * 1000,
	});
}

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN — Queries & Mutations
// ═════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Shifts
// ─────────────────────────────────────────────────────────────────────────────

export function useShifts() {
	return useQuery({
		queryKey: hrAdminKeys.shiftList(),
		queryFn: hrApi.fetchShifts,
		staleTime: 5 * 60 * 1000,
	});
}

export function useCreateShift() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateShiftPayload) => hrApi.postShift(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: hrAdminKeys.shifts() });
		},
	});
}

export function useUpdateShift() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateShiftPayload }) => hrApi.putShift(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: hrAdminKeys.shifts() });
		},
	});
}

export function useDeleteShift() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => hrApi.deleteShift(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: hrAdminKeys.shifts() });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Employee Profiles
// ─────────────────────────────────────────────────────────────────────────────

export function useEmployeeProfiles() {
	return useQuery({
		queryKey: hrAdminKeys.employeeProfileList(),
		queryFn: hrApi.fetchEmployeeProfiles,
		staleTime: 5 * 60 * 1000,
	});
}

export function useAssignHrProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateEmployeeProfilePayload) => hrApi.postEmployeeProfile(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: hrAdminKeys.employeeProfiles() });
		},
	});
}

export function useUpdateHrProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateEmployeeProfilePayload }) => hrApi.putEmployeeProfile(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: hrAdminKeys.employeeProfiles() });
		},
	});
}

export function useDeleteHrProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => hrApi.deleteEmployeeProfile(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: hrAdminKeys.employeeProfiles() });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Payroll Admin
// ─────────────────────────────────────────────────────────────────────────────

export function useAdminPayslips() {
	return useQuery({
		queryKey: hrAdminKeys.adminPayslips(),
		queryFn: hrApi.fetchAdminPayslips,
		staleTime: 2 * 60 * 1000,
	});
}

export function useGeneratePayroll() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: GeneratePayrollPayload) => hrApi.postGeneratePayroll(payload),
		onSuccess: () => {
			// Invalidate both admin and employee payslip lists
			queryClient.invalidateQueries({ queryKey: hrAdminKeys.adminPayslips() });
			queryClient.invalidateQueries({ queryKey: hrKeys.payslips() });
		},
	});
}

export function useApprovePayslip() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => hrApi.patchApprovePayslip(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: hrAdminKeys.adminPayslips() });
			queryClient.invalidateQueries({ queryKey: hrKeys.payslips() });
		},
	});
}

export function useMarkPayslipPaid() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => hrApi.patchMarkPaidPayslip(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: hrAdminKeys.adminPayslips() });
			queryClient.invalidateQueries({ queryKey: hrKeys.payslips() });
		},
	});
}

export function useDeleteDraftPayslip() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => hrApi.deleteDraftPayslip(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: hrAdminKeys.adminPayslips() });
			queryClient.invalidateQueries({ queryKey: hrKeys.payslips() });
		},
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// System Settings
// ─────────────────────────────────────────────────────────────────────────────

export function useSystemSetting(key: string, enabled = true) {
	return useQuery({
		queryKey: hrAdminKeys.systemSetting(key),
		queryFn: () => hrApi.fetchSystemSetting(key),
		enabled,
		staleTime: 10 * 60 * 1000,
	});
}

export function useUpdateSystemSetting() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ key, payload }: { key: string; payload: UpdateSystemSettingPayload }) => hrApi.putSystemSetting(key, payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: hrAdminKeys.systemSetting(variables.key) });
		},
	});
}
