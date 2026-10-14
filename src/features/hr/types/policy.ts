export interface HrLateDeductionTier {
	minimumMinutes: number;
	maximumMinutes: number | null;
	percentages: [number, number, number, number];
}

export type HrLateDeductionTiers = HrLateDeductionTier[];

export interface HrPolicySettings {
	workingDays: string[];
	workStartTime: string;
	workEndTime: string;
	dailyRateDivisor: number;
	unpaidLeaveDailyRateMultiplier: number;
	annualLeaveDays: number;
	sickLeaveDays: number;
	emergencyLeaveDays: number;
	leaveWorkflow: string;
	monthlyPaidPermissionHours: number;
	permissionOverageBehavior: string;
	lateDeductionReset: string;
	lateDeductionTiers: HrLateDeductionTiers;
	overtimeRequiresPreapproval: boolean;
	overtimeMultiplier: number;
	advanceLimitSalaryPercentage: number;
	advanceSettlement: string;
	allowAdvanceInstallments: boolean;
	payrollPaymentDay: number;
	midMonthHirePaidDays: number;
	taskSupervisorLimit: number;
}

export interface HrPolicy {
	policyId: number;
	settings: HrPolicySettings;
	effectiveFrom: string | null;
	createdBy: unknown;
	createdAt: string;
	notes: string | null;
}

export interface CreateHrPolicyPayload {
	settings: HrPolicySettings;
	effectiveFrom?: string;
	notes?: string;
}

export interface HrPolicyFormValues {
	settings: HrPolicySettings;
	effectiveFrom: string;
	notes: string;
}
