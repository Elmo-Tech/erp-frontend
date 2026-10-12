export interface EmployeeOverview {
	month: string;
	salary: number | null;
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
