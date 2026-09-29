import type { EmploymentContractWorkDay } from "./employment-contract";

export type EmployeePartialPayKind = "first_month" | "termination";
export type EmployeePartialPayStatus = "draft" | "approved" | "cancelled";

export interface EmployeePartialPayPolicySnapshot {
	dailyRateDivisor?: number | null;
	midMonthHirePaidDays?: number | null;
	settings?: Record<string, unknown>;
	[key: string]: unknown;
}

export interface EmployeePartialPayCalculation {
	employmentContractId: number;
	kind: EmployeePartialPayKind;
	payrollYear: number;
	payrollMonth: number;
	serviceStartDate: string;
	serviceEndDate: string;
	payableDays: number;
	baseSalarySnapshot: number;
	dailyRateSnapshot: number;
	grossAmount: number;
	policyVersionId: number | null;
	policySnapshot: EmployeePartialPayPolicySnapshot | null;
	contractWorkDays: EmploymentContractWorkDay[];
}

export interface EmployeePartialPayPreview extends EmployeePartialPayCalculation {}

export interface EmployeePartialPay extends EmployeePartialPayCalculation {
	id: number;
	employeeId: number;
	status: EmployeePartialPayStatus;
	approvedBy: number | null;
	approvedAt: string | null;
	reviewNote: string | null;
	salaryAdjustmentId: number | null;
	createdAt: string;
}

export interface EmployeePartialPaySummary {
	draftCount: number;
	approvedCount: number;
	cancelledCount: number;
	grossAmount: number;
	approvedGrossAmount: number;
}

export interface EmployeePartialPaysResponse {
	records: EmployeePartialPay[];
	summary: EmployeePartialPaySummary;
}

export interface CreateEmployeePartialPayPayload {
	contractId: number;
	kind: EmployeePartialPayKind;
	payrollYear: number;
	payrollMonth: number;
}

export interface EmployeePartialPayReviewPayload {
	reviewNote?: string;
}

export interface EmployeePartialPayFormValues {
	contractId: number | "";
	kind: EmployeePartialPayKind;
}
