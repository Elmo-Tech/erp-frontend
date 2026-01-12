/**
 * Milestone Types
 * Type definitions for contract milestones
 */

export enum MilestoneStatus {
	PENDING = "pending",
	INVOICED = "invoiced",
	PAID = "paid",
}

export enum MilestoneTriggerType {
	DATE = "date",
	PHASE_COMPLETION = "phase_completion",
	DELIVERABLE = "deliverable",
	MANUAL = "manual",
}

export const MilestoneStatusLabels: Record<MilestoneStatus, string> = {
	[MilestoneStatus.PENDING]: "Pending",
	[MilestoneStatus.INVOICED]: "Invoiced",
	[MilestoneStatus.PAID]: "Paid",
};

export const MilestoneStatusColors: Record<MilestoneStatus, string> = {
	[MilestoneStatus.PENDING]: "bg-gray-100 text-gray-800",
	[MilestoneStatus.INVOICED]: "bg-yellow-100 text-yellow-800",
	[MilestoneStatus.PAID]: "bg-green-100 text-green-800",
};

export interface Milestone {
	milestoneId: number;
	contractId: number;
	title: string;
	description: string | null;
	amount: number;
	percentage: number;
	dueDate: string | null;
	triggerType: MilestoneTriggerType;
	triggerValue: string | null;
	status: MilestoneStatus;
	invoiceId: number | null;
	paidAt: string | null;
	sortOrder: number;
	isOverdue: boolean;
	invoice?: {
		invoiceId: number;
		invoiceNumber: string;
		status: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface MilestoneListResponse {
	milestones: Milestone[];
}

export interface CreateMilestoneInvoicePayload {
	dueDate?: string;
	notes?: string;
	sendImmediately?: boolean;
}
