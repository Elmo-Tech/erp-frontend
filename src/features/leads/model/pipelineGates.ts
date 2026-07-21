import type { PipelineStage } from "./pipelineConstants";
import type { Lead } from "./types";

export const MEETING_GATE_MESSAGE = "Cannot advance: Complete the meeting and add notes first.";
export const ACCEPTED_DOCUMENT_GATE_MESSAGE = "Cannot advance: An accepted proposal or quotation is required first.";

export function getPipelineStageGateFailure(lead: Lead, toStage: PipelineStage): string | null {
	const requiresMeeting = toStage === "proposal" || toStage === "quotation" || toStage === "contract" || toStage === "closed_won";

	if (requiresMeeting && !lead.hasCompletedMeeting) {
		return MEETING_GATE_MESSAGE;
	}

	const requiresAcceptedDocument = toStage === "contract" || toStage === "closed_won";

	if (requiresAcceptedDocument && !lead.hasAcceptedProposalOrQuotation) {
		return ACCEPTED_DOCUMENT_GATE_MESSAGE;
	}

	return null;
}
