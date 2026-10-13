export interface EmployeeOverview {
	month: string;
	salary: number | null;
	salaryPeriod?: EmployeeSalaryPeriod;
	workCommitment?: EmployeeWorkCommitment;
	deductions: number;
	additions: number;
	advanceRecovery: number;
	advancesDisbursed: number;
	advancesOutstanding: number;
	scheduledRecovery: number;
	attendance: { days: number; lateDays: number; lateMinutes: number; workedMinutes: number };
	leaveDays: number;
	leaveBalances: Array<{ name: string; allocatedDays: number; usedDays: number; remainingDays: number }>;
	permissions: { count: number; totalMinutes: number; paidUsedMinutes: number; allocatedMinutes: number; remainingMinutes: number; overageMinutes: number };
	overtime: { requestedMinutes: number; actualMinutes: number; approvedMinutes: number; unapprovedMinutes: number; payableAmount: number };
}

export interface EmployeeWorkCommitment {
	employmentType: string | null;
	requiredMonthlyHours: number | null;
	requiredMinutes: number;
	workedMinutes: number;
	remainingMinutes: number;
	completionPercentage: number | null;
	hasPartTimeTarget: boolean;
}

export interface EmployeeSalaryPeriod {
	month: string;
	serviceDays: number;
	calendarDays: number;
	grossSalary: number;
	additions: number;
	totalDeductions: number;
	netSalary: number;
}
