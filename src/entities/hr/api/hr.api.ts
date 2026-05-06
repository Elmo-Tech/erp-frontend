/**
 * entities/hr/api/hr.api.ts
 *
 * Raw Axios fetcher functions for the HR domain.
 * NO React Query hooks here — hooks live in features/hr/model/use-hr-actions.ts.
 * Follows the same pattern as entities/client/api/client.api.ts.
 *
 * All endpoints are under /api/v1/hr/* and require auth:sanctum.
 */

import api from "@/shared/api/base";
import type {
	ApiEnvelope,
	AttendanceRecord,
	CreateEmployeeProfilePayload,
	CreateShiftPayload,
	EmployeeProfile,
	GeneratePayrollPayload,
	PaginatedResponse,
	Payslip,
	PointTransaction,
	Shift,
	SystemSetting,
	UpdateEmployeeProfilePayload,
	UpdateShiftPayload,
	UpdateSystemSettingPayload,
} from "@/entities/hr/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Employee — Points
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchMyPoints(): Promise<PaginatedResponse<PointTransaction>> {
	const res = await api.get<ApiEnvelope<PaginatedResponse<PointTransaction>>>("/hr/my-points");
	return res.data.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Employee — Attendance
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAttendanceList(): Promise<PaginatedResponse<AttendanceRecord>> {
	const res = await api.get<ApiEnvelope<PaginatedResponse<AttendanceRecord>>>("/hr/attendance");
	return res.data.data;
}

export async function fetchTodayAttendance(): Promise<AttendanceRecord | null> {
	const res = await api.get<ApiEnvelope<AttendanceRecord | null>>("/hr/attendance/today");
	return res.data.data;
}

export async function postCheckOut(): Promise<AttendanceRecord> {
	const res = await api.post<ApiEnvelope<AttendanceRecord>>("/hr/attendance/check-out");
	return res.data.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Employee — Payslips
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchMyPayslips(): Promise<PaginatedResponse<Payslip>> {
	const res = await api.get<ApiEnvelope<PaginatedResponse<Payslip>>>("/hr/payslips");
	return res.data.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Shifts
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchShifts(): Promise<Shift[]> {
	const res = await api.get<ApiEnvelope<Shift[]>>("/hr/shifts");
	return res.data.data;
}

export async function postShift(payload: CreateShiftPayload): Promise<Shift> {
	const res = await api.post<ApiEnvelope<Shift>>("/hr/shifts", payload);
	return res.data.data;
}

export async function putShift(id: number, payload: UpdateShiftPayload): Promise<Shift> {
	const res = await api.put<ApiEnvelope<Shift>>(`/hr/shifts/${id}`, payload);
	return res.data.data;
}

export async function deleteShift(id: number): Promise<void> {
	await api.delete(`/hr/shifts/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Employee Profiles
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchEmployeeProfiles(): Promise<EmployeeProfile[]> {
	const res = await api.get<ApiEnvelope<EmployeeProfile[]>>("/hr/employee-profiles");
	return res.data.data;
}

export async function postEmployeeProfile(payload: CreateEmployeeProfilePayload): Promise<EmployeeProfile> {
	const res = await api.post<ApiEnvelope<EmployeeProfile>>("/hr/employee-profiles", payload);
	return res.data.data;
}

export async function putEmployeeProfile(id: number, payload: UpdateEmployeeProfilePayload): Promise<EmployeeProfile> {
	const res = await api.put<ApiEnvelope<EmployeeProfile>>(`/hr/employee-profiles/${id}`, payload);
	return res.data.data;
}

export async function deleteEmployeeProfile(id: number): Promise<void> {
	await api.delete(`/hr/employee-profiles/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Payroll / Payslips
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAdminPayslips(): Promise<PaginatedResponse<Payslip>> {
	const res = await api.get<ApiEnvelope<PaginatedResponse<Payslip>>>("/hr/payslips");
	return res.data.data;
}

export async function postGeneratePayroll(payload: GeneratePayrollPayload): Promise<Payslip> {
	const res = await api.post<ApiEnvelope<Payslip>>("/hr/payslips/generate", payload);
	return res.data.data;
}

export async function patchApprovePayslip(id: number): Promise<Payslip> {
	const res = await api.patch<ApiEnvelope<Payslip>>(`/hr/payslips/${id}/approve`);
	return res.data.data;
}

export async function patchMarkPaidPayslip(id: number): Promise<Payslip> {
	const res = await api.patch<ApiEnvelope<Payslip>>(`/hr/payslips/${id}/mark-paid`);
	return res.data.data;
}

export async function deleteDraftPayslip(id: number): Promise<void> {
	await api.delete(`/hr/payslips/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin — System Settings
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchSystemSetting(key: string): Promise<SystemSetting> {
	const res = await api.get<ApiEnvelope<SystemSetting>>(`/settings/system/${key}`);
	return res.data.data;
}

export async function putSystemSetting(key: string, payload: UpdateSystemSettingPayload): Promise<SystemSetting> {
	const res = await api.put<ApiEnvelope<SystemSetting>>(`/settings/system/${key}`, payload);
	return res.data.data;
}
