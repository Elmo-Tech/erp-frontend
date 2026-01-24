export interface TaskDeliverable {
	deliverableId: number;
	taskId: number;
	title: string;
	description: string;
	acceptanceCriteria: string;
	status: DeliverableStatus;
	statusLabel: string;
	statusColor: string;
	submissionNotes: string;
	reviewNotes: string;
	submittedAt: string | null;
	reviewedAt: string | null;
	pointsAwarded: number;
	isBonus: boolean;
	order: number;
	canBeSubmitted: boolean;
	canBeReviewed: boolean;
	isCompleted: boolean;
	reviewer?: {
		userId: number;
		name: string;
		email: string;
		avatar: string;
	};
	createdAt: string;
	updatedAt: string;
}

export type DeliverableStatus = "pending" | "submitted" | "under_review" | "approved" | "rejected";

export interface DeliverablesSummary {
	total: number;
	pending: number;
	submitted: number;
	underReview: number;
	approved: number;
	rejected: number;
	totalPointsAwarded: number;
	totalPointsDeducted: number;
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
	pointsAwarded?: number;
	pointsDeducted?: number;
	reviewNotes?: string;
}

export interface ReorderDeliverablesData {
	deliverableIds: number[];
}

export interface DeliverablesResponse {
	deliverables: TaskDeliverable[];
	summary: DeliverablesSummary;
}
