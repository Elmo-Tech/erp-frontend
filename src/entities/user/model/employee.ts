export interface Employee {
	userId: number;
	name: string;
	email: string;
	avatar: string | null;
	isActive: boolean;
	role: string;
	specialization?: string | null;
	workHoursPerDay?: number;
	workStartTime?: string;
	expectedClockOut?: string | null;
	graceDaysAllowed?: number;
	graceDaysUsed?: number;
	graceDaysRemaining?: number;
	totalPoints?: number;
	skills?: string[];
	salary?: number | null;
	totalDeductions?: number | null;
	internalHourlyCost?: number | null;
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
