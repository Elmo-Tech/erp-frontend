export interface Attendance {
	attendanceId: number;
	userId: number;
	date: string;
	clockIn: string | null;
	clockOut: string | null;
	expectedClockIn: string | null;
	expectedClockOut: string | null;
	lateMinutes: number;
	idleMinutes: number;
	deductionMinutes: number;
	usedGraceDay: boolean;
	workedMinutes: number;
	isClockedIn: boolean;
	notes: string;
	user?: {
		userId: number;
		name: string;
		email: string;
		avatar: string;
	};
}

export interface AttendanceFilters {
	userId?: number;
	startDate?: string;
	endDate?: string;
	date?: string;
}

export interface AttendanceFormData {
	userId: number;
	date: string;
	clockIn: string;
	clockOut?: string | null;
	lateMinutes?: number;
	deductionMinutes?: number;
	notes?: string;
}

export interface PaginatedResponse<T> {
	attendances: T[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}
