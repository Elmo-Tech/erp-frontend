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
	CreateLeaveRequestPayload,
	CreatePayrollTransactionPayload,
	CreateShiftPayload,
	EmployeeProfile,
	EmployeeReport,
	GeneratePayrollPayload,
	LeaveRequest,
	PaginatedResponse,
	Payslip,
	PayrollTransaction,
	PointTransaction,
	Shift,
	SystemSetting,
	TeamPulseItem,
	UpdateEmployeeProfilePayload,
	UpdateLeaveRequestPayload,
	UpdatePayrollTransactionPayload,
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

export async function postCheckIn(): Promise<AttendanceRecord> {
	const res = await api.post<ApiEnvelope<AttendanceRecord>>("/hr/attendance/check-in");
	return res.data.data;
}

export async function postCheckOut(): Promise<AttendanceRecord> {
	const res = await api.post<ApiEnvelope<AttendanceRecord>>("/hr/attendance/check-out");
	return res.data.data;
}

export async function fetchTeamPulse(): Promise<TeamPulseItem[]> {
	const res = await api.get<ApiEnvelope<TeamPulseItem[]>>("/hr/team-pulse");
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

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Leave Requests
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchLeaveRequests(params?: Record<string, string>): Promise<PaginatedResponse<LeaveRequest>> {
	const query = params ? `?${new URLSearchParams(params).toString()}` : "";
	const res = await api.get<ApiEnvelope<PaginatedResponse<LeaveRequest>>>(`/hr/leave-requests${query}`);
	return res.data.data;
}

export async function postLeaveRequest(payload: CreateLeaveRequestPayload): Promise<LeaveRequest> {
	const res = await api.post<ApiEnvelope<LeaveRequest>>("/hr/leave-requests", payload);
	return res.data.data;
}

export async function putLeaveRequest(id: number, payload: UpdateLeaveRequestPayload): Promise<LeaveRequest> {
	const res = await api.put<ApiEnvelope<LeaveRequest>>(`/hr/leave-requests/${id}`, payload);
	return res.data.data;
}

export async function deleteLeaveRequest(id: number): Promise<void> {
	await api.delete(`/hr/leave-requests/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Payroll Transactions
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchPayrollTransactions(params?: Record<string, string>): Promise<PaginatedResponse<PayrollTransaction>> {
	const query = params ? `?${new URLSearchParams(params).toString()}` : "";
	const res = await api.get<ApiEnvelope<PaginatedResponse<PayrollTransaction>>>(`/hr/payroll-transactions${query}`);
	return res.data.data;
}

export async function postPayrollTransaction(payload: CreatePayrollTransactionPayload): Promise<PayrollTransaction> {
	const res = await api.post<ApiEnvelope<PayrollTransaction>>("/hr/payroll-transactions", payload);
	return res.data.data;
}

export async function putPayrollTransaction(id: number, payload: UpdatePayrollTransactionPayload): Promise<PayrollTransaction> {
	const res = await api.put<ApiEnvelope<PayrollTransaction>>(`/hr/payroll-transactions/${id}`, payload);
	return res.data.data;
}

export async function deletePayrollTransaction(id: number): Promise<void> {
	await api.delete(`/hr/payroll-transactions/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Employee 360 Report
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchEmployeeReport(userId: number, params: { month: number; year: number }): Promise<EmployeeReport> {
	const query = new URLSearchParams({
		month: String(params.month),
		year: String(params.year),
	});
	const res = await api.get<ApiEnvelope<EmployeeReport>>(`/hr/employee-report/${userId}?${query.toString()}`);
	return res.data.data;
}
