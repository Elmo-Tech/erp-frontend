/**
 * entities/hr/model/types.ts
 *
 * All TypeScript interfaces and types for the HR domain.
 * Derived directly from the backend Laravel Resources:
 *   - AttendanceResource, PointTransactionResource, PayslipResource,
 *     ShiftResource, EmployeeProfileResource
 *
 * NO React Query, NO Zod, NO hooks — pure types only.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiEnvelope<T> {
	data: T;
	message?: string;
	success?: boolean;
}

export interface PaginationMeta {
	total: number;
	count: number;
	current_page: number;
	last_page: number;
	per_page: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: PaginationMeta;
}

// ─────────────────────────────────────────────────────────────────────────────
// Point Transaction  (PointTransactionResource)
// ─────────────────────────────────────────────────────────────────────────────

export interface PointTransaction {
	id: number;
	/** Signed integer — positive = earned, negative = deducted */
	points: number;
	reason: string;
	/** Short label: 'task' | 'attendance' | 'code_review' | 'project' | … */
	model_type: string | null;
	model_id: number | null;
	created_at: string; // ISO-8601
}

// ─────────────────────────────────────────────────────────────────────────────
// Attendance  (AttendanceResource)
// ─────────────────────────────────────────────────────────────────────────────

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
	id: number;
	date: string; // YYYY-MM-DD
	clockIn: string | null; // ISO-8601
	clockOut: string | null; // ISO-8601
	status: AttendanceStatus;
	totalWorkedMinutes: number | null;
	lateMinutes: number | null;
	isLate: boolean;
	idleMinutes: number | null;
	deductionMinutes: number | null;
	usedGraceDay: boolean;
	expectedClockIn: string | null;
	expectedClockOut: string | null;
	notes: string | null;
	/** True when clocked in but not yet checked out */
	isClockedIn: boolean;
	user?: {
		id: number;
		name: string;
		avatar: string | null;
	};
	createdAt: string;
	updatedAt: string;
}

export interface TeamPulseItem {
	user: {
		id: number;
		name: string;
		email: string;
		avatar: string | null;
	} | null;
	attendanceId: number | null;
	status: "clocked_in" | "idle";
	clockIn: string | null;
	activeTaskId: number | null;
	activeTaskTitle: string | null;
	activeProjectId: number | null;
	activeProjectTitle: string | null;
	activeTimeEntryId: number | null;
	timerStartedAt: string | null;
	elapsedSeconds: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Payslip  (PayslipResource)
// ─────────────────────────────────────────────────────────────────────────────

export type PayslipStatus = "draft" | "approved" | "paid";

export interface Payslip {
	id: number;
	month: number;
	year: number;
	/** Formatted as "YYYY-MM" by the resource */
	period: string;
	/** Resource casts base_salary to float — always a number on the frontend */
	baseSalary: number;
	pointsEarned: number;
	pointsBonusAmount: number;
	latenessMinutes: number;
	latenessDeductionAmount: number;
	netSalary: number;
	status: PayslipStatus;
	/** Relation key is `employee` (not `user`) — see PayslipResource */
	employee?: {
		id: number;
		name: string;
		email: string;
		avatar: string | null;
	};
	createdAt: string;
	updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shift  (ShiftResource)
// ─────────────────────────────────────────────────────────────────────────────

export type DayOfWeek = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export interface Shift {
	id: number;
	name: string;
	/** HH:MM:SS format from backend — normalise to HH:MM in UI */
	startTime: string;
	endTime: string;
	workingDays: DayOfWeek[];
	gracePeriodMinutes: number;
	/** Populated when backend uses withCount('employeeProfiles') */
	employeeProfilesCount?: number;
	createdAt: string;
	updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Employee Profile  (EmployeeProfileResource)
// ─────────────────────────────────────────────────────────────────────────────

export interface EmployeeProfile {
	id: number;
	userId: number;
	shiftId: number | null;
	/** Resource casts base_salary to decimal:2 — always a number on the frontend */
	baseSalary: number;
	hourlyRate: number;
	joinDate: string; // YYYY-MM-DD
	user?: {
		id: number;
		name: string;
		email: string;
		avatar: string | null;
	};
	shift?: Shift;
	createdAt: string;
	updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// System Setting
// ─────────────────────────────────────────────────────────────────────────────

export interface SystemSetting {
	key: string;
	value: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Payload types (sent TO the backend)
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateShiftPayload {
	name: string;
	start_time: string; // HH:MM — matches date_format:H:i validation
	end_time: string;
	working_days: DayOfWeek[];
	grace_period_minutes?: number;
}

export interface UpdateShiftPayload {
	name?: string;
	start_time?: string;
	end_time?: string;
	working_days?: DayOfWeek[];
	grace_period_minutes?: number;
}

export interface CreateEmployeeProfilePayload {
	user_id: number;
	shift_id?: number | null;
	base_salary: number;
	hourly_rate: number;
	join_date: string; // YYYY-MM-DD
}

export interface UpdateEmployeeProfilePayload {
	shift_id?: number | null;
	base_salary?: number;
	hourly_rate?: number;
	join_date?: string;
}

export interface GeneratePayrollPayload {
	user_id: number;
	month: number; // 1–12
	year: number;
}

export interface UpdateSystemSettingPayload {
	value: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Leave Request  (LeaveRequestResource)
// ─────────────────────────────────────────────────────────────────────────────

export type LeaveType = "annual" | "sick" | "unpaid" | "permission";
export type LeaveStatus = "pending" | "approved" | "rejected";

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
	annual: "Annual",
	sick: "Sick",
	unpaid: "Unpaid",
	permission: "Permission",
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
	pending: "Pending",
	approved: "Approved",
	rejected: "Rejected",
};

export interface LeaveRequest {
	id: number;
	userId: number;
	startDate: string; // YYYY-MM-DD
	endDate: string; // YYYY-MM-DD
	durationDays: number;
	type: LeaveType;
	status: LeaveStatus;
	reason: string | null;
	user?: {
		id: number;
		name: string;
		email: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface CreateLeaveRequestPayload {
	user_id: number;
	start_date: string;
	end_date: string;
	type: LeaveType;
	status?: LeaveStatus;
	reason?: string | null;
}

export interface UpdateLeaveRequestPayload {
	start_date?: string;
	end_date?: string;
	type?: LeaveType;
	status?: LeaveStatus;
	reason?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Payroll Transaction  (PayrollTransactionResource)
// ─────────────────────────────────────────────────────────────────────────────

export type PayrollTransactionType = "manual_bonus" | "manual_deduction";

export const PAYROLL_TRANSACTION_TYPE_LABELS: Record<PayrollTransactionType, string> = {
	manual_bonus: "Manual Bonus",
	manual_deduction: "Manual Deduction",
};

export interface PayrollTransaction {
	id: number;
	userId: number;
	amount: number;
	type: PayrollTransactionType;
	reason: string;
	transactionDate: string; // YYYY-MM-DD
	user?: {
		id: number;
		name: string;
		email: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface CreatePayrollTransactionPayload {
	user_id: number;
	amount: number;
	type: PayrollTransactionType;
	reason: string;
	transaction_date: string;
}

export interface UpdatePayrollTransactionPayload {
	amount?: number;
	type?: PayrollTransactionType;
	reason?: string;
	transaction_date?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Employee 360 Report
// ─────────────────────────────────────────────────────────────────────────────

/** One row in the attendance section of the report */
export interface ReportAttendanceDay {
	date: string; // YYYY-MM-DD
	dayLabel: string; // "Mon 03"
	clockIn: string | null; // "09:05"
	clockOut: string | null; // "17:30"
	workedHours: number; // decimal hours, e.g. 8.25
	lateMinutes: number;
	status: AttendanceStatus;
	usedGraceDay: boolean;
	deductionMinutes: number;
}

/** One row in the point ledger section */
export interface ReportPointEntry {
	id: number;
	date: string; // YYYY-MM-DD
	points: number; // signed — positive = earned, negative = deducted
	reason: string;
	sourceType: string | null; // "task" | "attendance" | "code_review" | …
}

/** One row in the deliverables / daily checklist section */
export interface ReportDeliverableDay {
	date: string;
	submitted: boolean;
	taskCount: number;
	completedTaskCount: number;
	qaIssues: string[]; // list of QA/PM notes for that day
}

/** Financial breakdown card */
export interface ReportFinancialBreakdown {
	baseSalary: number;
	pointsBonusAmount: number;
	manualBonusTotal: number;
	latenessDeductionAmount: number;
	manualDeductionTotal: number;
	netSalary: number;
	/** Payslip status if one exists for this period */
	payslipStatus: PayslipStatus | null;
}

/** Top-level summary stats */
export interface ReportSummary {
	totalTaskHours: number;
	completedTaskCount: number;
	pointsBalance: number; // net points for the 2-month cycle
	lateDays: number;
	absentDays: number;
	presentDays: number;
	netSalary: number;
}

/** Root type returned by GET /hr/employee-report/{id}?month=X&year=Y */
export interface EmployeeReport {
	employee: {
		id: number;
		name: string;
		email: string;
		avatar: string | null;
		roles: string[];
	};
	period: {
		month: number;
		year: number;
		label: string; // "May 2026"
	};
	summary: ReportSummary;
	attendanceDays: ReportAttendanceDay[];
	pointLedger: ReportPointEntry[];
	deliverableDays: ReportDeliverableDay[];
	financialBreakdown: ReportFinancialBreakdown;
	manualTransactions: PayrollTransaction[];
}
