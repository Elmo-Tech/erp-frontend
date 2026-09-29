export type EmployeeAdvanceStatus = "pending" | "approved" | "rejected" | "cancelled" | "disbursed" | "settled";

export type EmployeeAdvanceSettlementStatus = "scheduled" | "settled" | (string & {});

export interface EmployeeAdvancePolicySnapshot {
	advanceLimitSalaryPercentage?: number | null;
	advanceSettlement?: string | null;
	allowAdvanceInstallments?: boolean | null;
	settings?: Record<string, unknown>;
	[key: string]: unknown;
}

export interface EmployeeAdvanceSettlement {
	id: number;
	sequence: number;
	dueOn: string;
	scheduledAmount: number;
	status: EmployeeAdvanceSettlementStatus;
	settledBy?: number | null;
	settledAt?: string | null;
	settlementReference?: string | null;
}

export interface EmployeeAdvance {
	id: number;
	employeeId: number;
	requestedAmount: number;
	approvedAmount: number | null;
	disbursedAmount: number | null;
	outstandingAmount: number;
	status: EmployeeAdvanceStatus;
	reason: string;
	installmentCount: number;
	policyVersionId: number | null;
	policySnapshot: EmployeeAdvancePolicySnapshot | null;
	salaryAtApproval: number | null;
	advanceLimitAmount: number | null;
	approvedBy: number | null;
	approvedAt: string | null;
	reviewNote: string | null;
	disbursedBy: number | null;
	disbursedAt: string | null;
	disbursementReference: string | null;
	settlements: EmployeeAdvanceSettlement[];
	createdAt: string;
}

export interface EmployeeAdvanceSummary {
	requestedAmount: number;
	approvedAmount: number;
	disbursedAmount: number;
	outstandingAmount: number;
	pendingCount: number;
	scheduledSettlementAmount: number;
}

export interface EmployeeAdvancesResponse {
	advances: EmployeeAdvance[];
	summary: EmployeeAdvanceSummary;
}

export interface CreateEmployeeAdvancePayload {
	requestedAmount: number;
	reason: string;
	installmentCount: number;
}

export interface ApproveEmployeeAdvancePayload {
	approvedAmount?: number;
	reviewNote?: string;
}

export interface EmployeeAdvanceReviewPayload {
	reviewNote?: string;
}

export interface DisburseEmployeeAdvancePayload {
	disbursementReference?: string;
}

export interface SettleEmployeeAdvanceSettlementPayload {
	settlementReference?: string;
}

export interface EmployeeAdvanceFormValues {
	requestedAmount: number | "";
	reason: string;
	installmentCount: number | "";
}
