export type LateDeductionStatus = "calculated" | "waived" | "overridden";

export interface LateDeductionRecord {
	id: number;
	employeeId: number;
	attendanceId: number;
	attendanceDate: string;
	originalLateMinutes: number;
	eligibleLateMinutes: number;
	occurrenceNumber: number | null;
	tierMinimumMinutes: number | null;
	tierMaximumMinutes: number | null;
	percentage: number;
	dailyRate: number;
	calculatedAmount: number;
	overrideAmount: number | null;
	finalAmount: number;
	status: LateDeductionStatus;
	waiverReason?: string | null;
	overrideReason?: string | null;
	policyVersionId?: number | null;
	salaryAdjustmentId?: number | null;
	evaluatedAt: string;
}

export interface LateDeductionsSummary {
	calculatedAmount: number;
	adjustedAmount: number;
	waivedCount: number;
	evaluatedCount: number;
}

export interface LateDeductionsResponse {
	records: LateDeductionRecord[];
	summary: LateDeductionsSummary;
}

export interface EvaluateLateDeductionsPayload {
	year: number;
	month: number;
}

export interface OverrideLateDeductionPayload {
	amount: number;
	reason: string;
}

export interface LateDeductionOverrideFormValues {
	amount: number | "";
	reason: string;
}
