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
