import type { PipelineStage, SkipReason } from "./pipelineConstants";
import type { QuotationDirectUploadValues, ContractDirectUploadValues, ProposalDirectUploadValues, MeetingScheduleValues } from "../ui/PipelineModals/stageModal.schema";

// ─────────────────────────────────────────────────────────────────────────────
// Lead entity
// ─────────────────────────────────────────────────────────────────────────────

export interface Lead {
	id: number;
	name: string;
	company?: string;
	email?: string;
	phone?: string;
	stage: PipelineStage;
	assignedTo?: number;
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
}

/** Generic direct-upload (fallback) */
export interface GenericDirectUploadPayload {
	mode: "direct_upload";
	upload_file: File;
	notes?: string;
}

/** Proposal-specific direct-upload */
export interface ProposalDirectUploadPayload extends ProposalDirectUploadValues {
	mode: "direct_upload";
}

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

export type StageModalPayload = TaskPayload | MeetingSchedulePayload | GenericDirectUploadPayload | ProposalDirectUploadPayload | QuotationDirectUploadPayload | ContractDirectUploadPayload | SkipPayload;

/** Collected result for a single stage in the queue */
export interface StageModalResult {
	stage: ModalQueueItemType;
	payload: StageModalPayload;
}
