/**
 * entities/hr/model/query-keys.ts
 *
 * Canonical React Query key factories for the HR domain.
 * Follows the same factory pattern used by clientKeys, projectKeys, etc.
 *
 * Two namespaces:
 *   hrKeys      — employee-facing endpoints (my-points, attendance, payslips)
 *   hrAdminKeys — admin-facing endpoints (shifts, employee-profiles, payroll, settings)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Employee-facing keys
// ─────────────────────────────────────────────────────────────────────────────

export const hrKeys = {
	all: ["hr"] as const,

	// Points
	points: () => [...hrKeys.all, "my-points"] as const,

	// Attendance — parent key used for broad invalidation after check-out
	attendance: () => [...hrKeys.all, "attendance"] as const,
	attendanceList: () => [...hrKeys.attendance(), "list"] as const,
	attendanceToday: () => [...hrKeys.attendance(), "today"] as const,

	// Payslips
	payslips: () => [...hrKeys.all, "payslips"] as const,
	payslipList: () => [...hrKeys.payslips(), "list"] as const,
	payslipDetail: (id: number) => [...hrKeys.payslips(), id] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin-facing keys
// ─────────────────────────────────────────────────────────────────────────────

export const hrAdminKeys = {
	all: ["hr-admin"] as const,

	// Shifts
	shifts: () => [...hrAdminKeys.all, "shifts"] as const,
	shiftList: () => [...hrAdminKeys.shifts(), "list"] as const,
	shiftDetail: (id: number) => [...hrAdminKeys.shifts(), id] as const,

	// Employee Profiles
	employeeProfiles: () => [...hrAdminKeys.all, "employee-profiles"] as const,
	employeeProfileList: () => [...hrAdminKeys.employeeProfiles(), "list"] as const,
	employeeProfileDetail: (id: number) => [...hrAdminKeys.employeeProfiles(), id] as const,

	// Admin Payslips (separate from employee payslipList — different scope)
	adminPayslips: () => [...hrAdminKeys.all, "admin-payslips"] as const,

	// System Settings
	systemSettings: () => [...hrAdminKeys.all, "system-settings"] as const,
	systemSetting: (key: string) => [...hrAdminKeys.systemSettings(), key] as const,
};
