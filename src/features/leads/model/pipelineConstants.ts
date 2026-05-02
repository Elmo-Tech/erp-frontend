/**
 * Pipeline stage definitions for the Sales Pipeline Kanban Board.
 * Stages are strictly ordered — users cannot silently skip stages.
 */

export const PIPELINE_STAGES = ["new", "meeting", "proposal", "quotation", "contract", "closed_won"] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

/** Stages that require a modal interaction (create task / upload / skip) */
export const MODAL_REQUIRED_STAGES: PipelineStage[] = ["meeting", "proposal", "quotation", "contract"];

export const STAGE_LABELS: Record<PipelineStage, string> = {
	new: "New",
	meeting: "Meeting",
	proposal: "Proposal",
	quotation: "Quotation",
	contract: "Contract",
	closed_won: "Closed Won",
};

export const SKIP_REASONS = ["Client not ready", "Budget constraints", "Skipped by client request", "Internal decision", "Duplicate lead", "Other"] as const;

export type SkipReason = (typeof SKIP_REASONS)[number];
