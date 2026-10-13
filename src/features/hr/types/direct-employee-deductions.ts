export interface DirectDeductionType {
	id: number;
	name: string;
}

export type DirectEmployeeDeductionStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface DirectEmployeeDeduction {
	id: number;
	employeeId: number;
	deductionType: DirectDeductionType;
	deductionDate: string;
	occurredAt?: string | null;
	amount: number;
	status: DirectEmployeeDeductionStatus;
	reason: string;
	approvedBy?: number | null;
	approvedAt?: string | null;
	rejectionReason?: string | null;
	salaryAdjustmentId?: number | null;
	createdAt: string;
}

export interface DirectEmployeeDeductionSummary {
	approvedAmount: number;
	pendingCount: number;
	approvedCount: number;
}

export interface DirectEmployeeDeductionsResponse {
	deductions: DirectEmployeeDeduction[];
	summary: DirectEmployeeDeductionSummary;
}

export interface CreateDirectEmployeeDeductionPayload {
	deductionTypeId?: number;
	deductionDate: string;
	occurredAt?: string;
	amount: number;
	reason: string;
}

export interface DirectEmployeeDeductionReviewPayload {
	reviewNote?: string;
}

export interface RejectDirectEmployeeDeductionPayload {
	reviewNote: string;
}

export interface DirectEmployeeDeductionFormValues {
	deductionTypeId: string;
	deductionDate: string;
	amount: number | "";
	reason: string;
}
