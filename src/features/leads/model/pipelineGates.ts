import type { PipelineStage } from "./pipelineConstants";
import type { Lead } from "./types";

export const MEETING_GATE_MESSAGE = "Cannot advance: Complete the meeting and add notes first.";
export const ACCEPTED_DOCUMENT_GATE_MESSAGE = "Cannot advance: An accepted proposal or quotation is required first.";

export function getPipelineStageGateFailure(lead: Lead, toStage: PipelineStage): string | null {
	if ((toStage === "proposal" || toStage === "quotation") && !lead.hasCompletedMeeting) {
		return MEETING_GATE_MESSAGE;
	}

	if (toStage === "contract" && !lead.hasAcceptedProposalOrQuotation) {
		return ACCEPTED_DOCUMENT_GATE_MESSAGE;
	}

	return null;
}
