export interface LeaveType {
	id: number;
	name: string;
	slug: string;
	annualAllowanceDays: number;
	isPaid: boolean;
	isActive: boolean;
	displayOrder: number;
}

export interface LeaveTypePayload {
	name: string;
	slug: string;
	annualAllowanceDays: number;
	isPaid: boolean;
	isActive: boolean;
	displayOrder: number;
}

export type CreateLeaveTypePayload = LeaveTypePayload;

export type UpdateLeaveTypePayload = Partial<LeaveTypePayload>;

export type LeaveTypeFormValues = LeaveTypePayload;

export type EmployeeLeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface EmployeeLeave {
	id: number;
	employeeId: number;
	leaveType: LeaveType;
	leaveTypeId: number;
	startDate: string;
	endDate: string;
	workingDays: number;
	status: EmployeeLeaveStatus;
	isPaid: boolean;
	reason?: string | null;
	reviewedBy?: number | null;
	reviewedAt?: string | null;
	reviewNote?: string | null;
	createdAt: string;
}

export interface LeaveBalance {
	leaveTypeId: number;
	leaveType: LeaveType;
	allocatedDays: number;
	usedDays: number;
	remainingDays: number;
}

export interface EmployeeLeavesResponse {
	leaves: EmployeeLeave[];
	balances: LeaveBalance[];
}

export interface CreateEmployeeLeavePayload {
	leaveTypeId: number;
	startDate: string;
	endDate: string;
	reason?: string;
}

export interface ReviewEmployeeLeavePayload {
	reviewNote?: string;
}

export interface LeaveRequestFormValues {
	leaveTypeId: string;
	startDate: string;
	endDate: string;
	reason: string;
}
