export interface AttendanceUser {
	userId: number;
	name: string;
	email: string;
	avatar?: string | null;
	graceDaysRemaining?: number;
}

export interface Attendance {
	attendanceId: number;
	userId: number;
	date: string;
	clockIn: string | null;
	clockOut: string | null;
	expectedClockIn: string | null;
	expectedClockOut: string | null;
	lateMinutes: number;
	isLate?: boolean;
	idleMinutes: number;
	deductionMinutes: number;
	usedGraceDay: boolean;
	workedMinutes: number;
	isClockedIn: boolean;
	notes: string;
	user?: AttendanceUser | null;
}

export interface AttendanceFilters {
	userId?: number;
	startDate?: string;
	endDate?: string;
	date?: string;
	page?: number;
	perPage?: number;
}

export interface AttendancePagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

export interface AttendanceListResponse {
	attendances: Attendance[];
	pagination: AttendancePagination;
}

export interface TodayAttendanceResponse {
	attendance: Attendance | null;
	hasActiveTimer: boolean;
	totalWorkedMinutes: number;
	currentIdleMinutes?: number;
	expectedClockOut: string | null;
	graceDaysRemaining: number;
}

export interface AttendanceSummary {
	year: number;
	month: number;
	totalDays: number;
	totalLateMinutes: number;
	totalIdleMinutes: number;
	totalDeductionMinutes: number;
	graceDaysUsed: number;
	graceDaysRemaining: number;
	totalWorkedMinutes: number;
	totalWorkedHours: number;
	deductionAmount: number;
	expectedWorkDays: number;
}

export interface CreateAttendancePayload {
	userId: number;
	date: string;
	clockIn: string;
	clockOut?: string | null;
	notes?: string | null;
	isGraceDay?: boolean;
	deductionMinutes?: number;
}

export interface UpdateAttendancePayload {
	clockIn?: string;
	clockOut?: string | null;
	lateMinutes?: number;
	deductionMinutes?: number;
	notes?: string | null;
}

