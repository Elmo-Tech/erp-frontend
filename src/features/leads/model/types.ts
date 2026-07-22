import type { PipelineStage, SkipReason } from "./pipelineConstants";
import type { QuotationDirectUploadValues, ContractDirectUploadValues, ProposalDirectUploadValues } from "../ui/PipelineModals/stageModal.schema";

// ─────────────────────────────────────────────────────────────────────────────
// Lead entity
// ─────────────────────────────────────────────────────────────────────────────

export interface Lead {
	id: number;
	name: string;
	company?: string;
	email?: string;
	phone?: string;
	contactName?: string;
	notes?: string;
	source?: string;
	expectedCloseDate?: string;
	stage: PipelineStage;
	assignedTo?: number;
	assignee?: {
		id: number;
		name: string;
		email: string;
		avatar: string | null;
	};
	expectedBudget?: number;
	hasCompletedMeeting?: boolean;
	hasAcceptedProposalOrQuotation?: boolean;
	createdAt: string;
	updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal queue
// ─────────────────────────────────────────────────────────────────────────────

export type ModalQueueItemType = "meeting" | "proposal" | "quotation" | "contract";

export interface ModalQueueItem {
	stage: ModalQueueItemType;
	isIntermediateSkip: boolean;
	requiresDocumentUpload?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Drag interceptor state
// ─────────────────────────────────────────────────────────────────────────────

export interface PendingDrag {
	leadId: number;
	fromStage: PipelineStage;
	toStage: PipelineStage;
	snapshot: Lead[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage modal payloads
// ─────────────────────────────────────────────────────────────────────────────

export type CreationMode = "task" | "direct_upload" | "skip" | "schedule";

export interface TaskPayload {
	mode: "task";
	assignedTo: number;
	deadline: string;
	notes?: string;
	/**
	 * Backend state scaffold for task fulfillment.
	 *
	 * When a document (Proposal / Quotation / Contract) is created as a Task,
	 * the backend sets this to "pending_fulfillment". The task is only
	 * considered complete when the assignee fulfills the DirectUpload schema
	 * (uploads the PDF and sets the required financials).
	 *
	 * Lifecycle: pending_fulfillment → fulfilled | rejected
	 *
	 * Frontend reads this to show a "Fulfill Task" CTA on the task card.
	 */
	fulfillmentStatus?: "pending_fulfillment" | "fulfilled" | "rejected";
	/**
	 * REQUIRED when fulfillmentStatus === "rejected".
	 * The backend must enforce this constraint.
	 */
	rejectionReason?: string;
}

/** Meeting schedule payload */
export interface MeetingSchedulePayload {
	mode: "schedule";
	meeting_type: string;
	date: string;
	time: string;
	location_type: string;
	location_details?: string;
	internal_attendees: string[];
	external_attendees: string[];
	notes?: string;
}

/** Generic direct-upload (fallback) */
export interface GenericDirectUploadPayload {
	mode: "direct_upload";
	upload_file: File;
	notes?: string;
}

/** Proposal-specific direct-upload */
export type ProposalDirectUploadPayload = ProposalDirectUploadValues & {
	mode: "direct_upload";
};

/** Quotation-specific direct-upload */
export interface QuotationDirectUploadPayload extends Omit<QuotationDirectUploadValues, "upload_file"> {
	mode: "direct_upload";
	upload_file: File;
}

/** Contract-specific direct-upload */
export interface ContractDirectUploadPayload extends Omit<ContractDirectUploadValues, "upload_file"> {
	mode: "direct_upload";
	upload_file: File;
}

export interface SkipPayload {
	mode: "skip";
	skipReason: SkipReason;
	notes?: string;
}

/**
 * Rejection payload — used when a task is rejected by the assignee or manager.
 * `rejection_reason` is STRICTLY REQUIRED.
 */
export interface RejectionPayload {
	mode: "rejection";
	/** REQUIRED — must always be provided when rejecting. */
	rejectionReason: string;
	notes?: string;
}

export type StageModalPayload = TaskPayload | MeetingSchedulePayload | GenericDirectUploadPayload | ProposalDirectUploadPayload | QuotationDirectUploadPayload | ContractDirectUploadPayload | SkipPayload | RejectionPayload;

/** Collected result for a single stage in the queue */
export interface StageModalResult {
	stage: ModalQueueItemType;
	payload: StageModalPayload;
}
