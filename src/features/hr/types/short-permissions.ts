export type EmployeeShortPermissionStatus = "pending" | "approved" | "rejected" | "cancelled";

export type PermissionCompensationType = "paid" | "unpaid";

export interface EmployeeShortPermission {
	id: number;
	employeeId: number;
	permissionDate: string;
	startTime: string;
	endTime: string;
	durationMinutes: number;
	isPaid: boolean | null;
	status: EmployeeShortPermissionStatus;
	reason?: string | null;
	reviewedBy?: number | null;
	reviewedAt?: string | null;
	reviewNote?: string | null;
	policyVersionId?: number | null;
	createdAt: string;
}

export interface PermissionAllowance {
	period: string;
	allocatedMinutes: number;
	usedPaidMinutes: number;
	remainingMinutes: number;
	overageMinutes: number;
}

export interface EmployeeShortPermissionsResponse {
	permissions: EmployeeShortPermission[];
	allowance: PermissionAllowance;
	canReview?: boolean;
}

export interface PendingEmployeeShortPermission extends EmployeeShortPermission {
	employee: { userId: number; name: string };
	canReview: boolean;
}

export interface CreateEmployeeShortPermissionPayload {
	permissionDate: string;
	startTime: string;
	endTime: string;
	reason?: string;
}

export interface ApproveEmployeeShortPermissionPayload {
	compensationType: PermissionCompensationType;
	reviewNote?: string;
}

export interface ReviewEmployeeShortPermissionPayload {
	reviewNote?: string;
}

export interface ShortPermissionRequestFormValues {
	permissionDate: string;
	startTime: string;
	endTime: string;
	reason: string;
}
