export type EmployeeAttendanceStatus = "not_started" | "clocked_in" | "on_break" | "clocked_out" | "late" | "absent";
export type ProjectMemberRole = "lead" | "member" | "reviewer";

export interface EmployeeRole {
	id?: number;
	name: string;
	displayName?: string;
	description?: string | null;
}

export interface Employee {
	userId: number;
	name: string;
	email: string;
	avatar: string | null;
	isActive: boolean;
	role: string;
	specialization?: string | null;
	attendanceStatus?: EmployeeAttendanceStatus | null;
	workHoursPerDay: number;
	workStartTime: string;
	expectedClockOut: string | null;
	graceDaysAllowed: number;
	graceDaysUsed: number;
	graceDaysRemaining: number;
	totalPoints: number;
	skills: string[];
	salary: number | null;
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

export interface CreateEmployeePayload {
	name: string;
	email: string;
	password: string;
	role?: string;
	specialization?: string;
	isActive?: boolean;
	salary?: number;
	workHoursPerDay?: number;
	workStartTime?: string;
	graceDaysAllowed?: number;
	internalHourlyCost?: number;
	skills?: string[];
}

export interface UpdateEmployeePayload {
	name?: string;
	email?: string;
	password?: string;
	role?: string;
	specialization?: string;
	isActive?: boolean;
	salary?: number | null;
	workHoursPerDay?: number;
	workStartTime?: string;
	graceDaysAllowed?: number;
	internalHourlyCost?: number | null;
	skills?: string[];
	avatar?: string | null;
}

export interface EmployeePerformance {
	employee: Pick<Employee, "userId" | "name" | "email" | "avatar">;
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

export interface ProjectMemberUser {
	userId: number;
	name: string;
	email: string;
	avatar?: string | null;
}

export interface ProjectMember {
	memberId: number;
	projectId: number;
	userId: number;
	role: ProjectMemberRole;
	user?: ProjectMemberUser | null;
	createdAt: string;
}

export interface ProjectMemberListResponse {
	members: ProjectMember[];
}

export interface CreateProjectMemberPayload {
	userId: number;
	role?: ProjectMemberRole;
}

export interface UpdateProjectMemberPayload {
	role: ProjectMemberRole;
}

export const PROJECT_MEMBER_ROLES: Array<{ value: ProjectMemberRole; label: string }> = [
	{ value: "lead", label: "Lead" },
	{ value: "member", label: "Member" },
	{ value: "reviewer", label: "Reviewer" },
];
