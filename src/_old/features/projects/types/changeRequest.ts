/**
 * Change Request Types
 * Type definitions for project change requests
 */

export enum ChangeRequestStatus {
	DRAFT = "draft",
	PENDING = "pending",
	APPROVED = "approved",
	REJECTED = "rejected",
	IMPLEMENTED = "implemented",
}

export const ChangeRequestStatusLabels: Record<ChangeRequestStatus, string> = {
	[ChangeRequestStatus.DRAFT]: "Draft",
	[ChangeRequestStatus.PENDING]: "Pending Review",
	[ChangeRequestStatus.APPROVED]: "Approved",
	[ChangeRequestStatus.REJECTED]: "Rejected",
	[ChangeRequestStatus.IMPLEMENTED]: "Implemented",
};

export const ChangeRequestStatusColors: Record<ChangeRequestStatus, string> = {
	[ChangeRequestStatus.DRAFT]: "bg-gray-100 text-gray-800",
	[ChangeRequestStatus.PENDING]: "bg-yellow-100 text-yellow-800",
	[ChangeRequestStatus.APPROVED]: "bg-green-100 text-green-800",
	[ChangeRequestStatus.REJECTED]: "bg-red-100 text-red-800",
	[ChangeRequestStatus.IMPLEMENTED]: "bg-blue-100 text-blue-800",
};

export interface ChangeRequest {
	changeRequestId: number;
	crNumber: string;
	projectId: number;
	requestedBy: number;
	title: string;
	description: string;
	impactAnalysis: string | null;
	isBillable: boolean;
	estimatedHours: number;
	estimatedCost: number;
	approvedCost: number | null;
	additionalDays: number;
	status: ChangeRequestStatus;
	approvedBy: number | null;
	approvedAt: string | null;
	rejectionReason: string | null;
	requester?: {
		userId: number;
		name: string;
		email: string;
	};
	approver?: {
		userId: number;
		name: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface ChangeRequestSummary {
	total: number;
	pending: number;
	approved: number;
	rejected: number;
	implemented: number;
	totalApprovedCost: number;
	totalAdditionalDays: number;
}

export interface CreateChangeRequestPayload {
	title: string;
	description: string;
	impactAnalysis?: string;
	isBillable: boolean;
	estimatedHours: number;
	estimatedCost: number;
	additionalDays?: number;
}

export interface UpdateChangeRequestPayload {
	title?: string;
	description?: string;
	impactAnalysis?: string;
	isBillable?: boolean;
	estimatedHours?: number;
	estimatedCost?: number;
	additionalDays?: number;
}

export interface ChangeRequestListResponse {
	changeRequests: ChangeRequest[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}
