export interface Attendance {
	attendanceId: number;
	userId: number;
	date: string;
	source: 'web' | 'device' | 'manual';
	deviceId: number | null;
	clockIn: string | null;
	clockOut: string | null;
	expectedClockIn: string | null;
	expectedClockOut: string | null;
	lateMinutes: number;
	isLate: boolean;
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
		graceDaysRemaining?: number;
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
	notes?: string;
	isGraceDay?: boolean;
	deductionMinutes?: number;
}

export interface DeductionType {
	id: number;
	name: string;
	description?: string;
	isActive: boolean;
}

export interface EmployeeDeduction {
	id: number;
	userId: number;
	deductionTypeId: number;
	deductionDate: string;
	amount: number;
	reason: string;
	status: 'pending' | 'approved' | 'rejected' | 'cancelled';
	attendanceId?: number;
	lateMinutes?: number;
	approvedBy?: number;
	approvedAt?: string;
	createdAt: string;
	user?: {
		userId: number;
		name: string;
	};
	deductionType?: DeductionType;
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
