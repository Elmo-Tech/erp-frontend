/**
 * Task Deliverable Types
 * Types for task deliverables feature
 */

export enum DeliverableStatus {
	PENDING = "pending",
	SUBMITTED = "submitted",
	UNDER_REVIEW = "under_review",
	APPROVED = "approved",
	REJECTED = "rejected",
}

export interface TaskDeliverable {
	deliverableId: number;
	taskId: number;
	title: string;
	description?: string;
	acceptanceCriteria?: string;
	status: DeliverableStatus;
	submissionNotes?: string;
	reviewNotes?: string;
	submittedAt?: string;
	reviewedAt?: string;
	reviewedBy?: {
		userId: number;
		name: string;
	};
	pointsAwarded: number;
	isBonus: boolean;
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface CreateDeliverableData {
	title: string;
	description?: string;
	acceptanceCriteria?: string;
	isBonus?: boolean;
	order?: number;
}

export interface UpdateDeliverableData {
	title?: string;
	description?: string;
	acceptanceCriteria?: string;
	isBonus?: boolean;
	order?: number;
}

export interface SubmitDeliverableData {
	submissionNotes?: string;
}

export interface ReviewDeliverableData {
	status: DeliverableStatus.APPROVED | DeliverableStatus.REJECTED;
	reviewNotes?: string;
	pointsAwarded?: number;
}

export interface ReorderDeliverablesData {
	deliverableIds: number[];
}

export interface DeliverablesResponse {
	deliverables: TaskDeliverable[];
}

export interface DeliverablesSummary {
	total: number;
	pending: number;
	submitted: number;
	underReview: number;
	approved: number;
	rejected: number;
}
