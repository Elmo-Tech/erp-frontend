export type EmployeeOvertimeRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface EmployeeOvertimeRequest {
	id: number;
	employeeId: number;
	overtimeDate: string;
	startTime: string;
	endTime: string;
	requestedMinutes: number;
	actualMinutes: number | null;
	approvedMinutes: number | null;
	unapprovedMinutes: number;
	status: EmployeeOvertimeRequestStatus;
	reason: string;
	reviewedBy: number | null;
	reviewedAt: string | null;
	reviewNote: string | null;
	policyVersionId: number | null;
	hourlyRate: number | null;
	overtimeMultiplier: number | null;
	payableAmount: number | null;
	createdAt: string;
}

export interface EmployeeOvertimeSummary {
	requestedMinutes: number;
	actualMinutes: number;
	approvedMinutes: number;
	unapprovedMinutes: number;
	payableAmount: number;
	pendingCount: number;
}

export interface EmployeeOvertimeRequestsResponse {
	requests: EmployeeOvertimeRequest[];
	summary: EmployeeOvertimeSummary;
}

export interface CreateEmployeeOvertimeRequestPayload {
	overtimeDate: string;
	startTime: string;
	endTime: string;
	reason: string;
}

export interface ReviewEmployeeOvertimeRequestPayload {
	reviewNote?: string;
}

export interface OvertimeRequestFormValues {
	overtimeDate: string;
	startTime: string;
	endTime: string;
	reason: string;
}
