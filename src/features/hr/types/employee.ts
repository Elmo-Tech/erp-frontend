/**
 * Employee Types
 * Type definitions for employee management
 */

export interface EmployeePersonalDetails {
	jobTitle?: string | null;
	workArrangement?: "on_site" | "freelance" | "remote" | "" | null;
	birthDate?: string | null;
	appointmentDate?: string | null;
	residence?: string | null;
	nationalId?: string | null;
	mobile?: string | null;
	otherPhone?: string | null;
	education?: string | null;
}

export interface Employee extends EmployeePersonalDetails {
	canViewPersonalDetails?: boolean;
	employmentType?: string | null;
	userId: number;
	name: string;
	email: string;
	avatar: string;
	isActive: boolean;
	role: string;
	specialization?: string;
	workHoursPerDay: number;
	monthlyWorkHours?: number;
	workStartTime: string;
	expectedClockOut: string | null;
	graceDaysAllowed: number;
	graceDaysUsed: number;
	graceDaysRemaining: number;
	totalPoints: number;
	skills: string[];
	salary: number | null;
	hourlyRate?: number | null;
	totalDeductions: number | null;
	internalHourlyCost: number | null;
	createdAt: string;
}

export interface EmployeeFilters {
	search?: string;
	isActive?: boolean;
	page?: number;
	perPage?: number;
}

export interface EmployeePagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

export interface EmployeeListResponse {
	employees: Employee[];
	pagination: EmployeePagination;
}

export interface CreateEmployeePayload extends EmployeePersonalDetails {
	name: string;
	email: string;
	password: string;
	role?: string;
	specialization?: string;
	isActive?: boolean;
	salary?: number;
	hourlyRate?: number | null;
	workHoursPerDay?: number;
	workStartTime?: string;
	graceDaysAllowed?: number;
	internalHourlyCost?: number;
	skills?: string[];
}

export interface UpdateEmployeePayload extends EmployeePersonalDetails {
	name?: string;
	email?: string;
	password?: string;
	role?: string;
	specialization?: string;
	isActive?: boolean;
	salary?: number | null;
	hourlyRate?: number | null;
	workHoursPerDay?: number;
	workStartTime?: string;
	graceDaysAllowed?: number;
	internalHourlyCost?: number | null;
	skills?: string[];
	avatar?: string;
}

export interface EmployeePerformance {
	workCommitment?: import("./employee-overview").EmployeeWorkCommitment;
	employee: {
		userId: number;
		name: string;
		email: string;
		avatar: string;
	};
	period: {
		year: number;
		month: number;
	};
	attendance: {
		totalDays: number;
		totalLateMinutes: number;
		totalIdleMinutes: number;
		graceDaysUsed: number;
		graceDaysRemaining: number;
	};
	deductions: {
		totalMinutes: number;
		totalAmount: number;
	};
	performance: {
		pointsEarned: number;
		totalPoints: number;
		projectsWorkedOn: number;
		projects: Array<{
			projectId: number;
			title: string;
		}>;
	};
}
