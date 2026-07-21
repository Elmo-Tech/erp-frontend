import { describe, expect, it } from "vitest";
import { getPipelineStageGateFailure } from "../pipelineGates";
import type { Lead } from "../types";

const baseLead: Lead = {
	id: 1,
	name: "ACME",
	stage: "meeting",
	createdAt: "2026-05-14T10:00:00.000Z",
	updatedAt: "2026-05-14T10:00:00.000Z",
};

describe("pipeline stage gates", () => {
	it("blocks proposal and quotation when no completed meeting exists", () => {
		expect(getPipelineStageGateFailure({ ...baseLead, hasCompletedMeeting: false }, "proposal")).toBe("Cannot advance: Complete the meeting and add notes first.");
		expect(getPipelineStageGateFailure({ ...baseLead, hasCompletedMeeting: false }, "quotation")).toBe("Cannot advance: Complete the meeting and add notes first.");
		expect(getPipelineStageGateFailure({ ...baseLead, hasCompletedMeeting: false }, "closed_won")).toBe("Cannot advance: Complete the meeting and add notes first.");
	});

	it("blocks contract when there is no accepted proposal or quotation", () => {
		expect(getPipelineStageGateFailure({ ...baseLead, hasCompletedMeeting: true, hasAcceptedProposalOrQuotation: false }, "contract")).toBe(
			"Cannot advance: An accepted proposal or quotation is required first.",
		);
		expect(getPipelineStageGateFailure({ ...baseLead, hasCompletedMeeting: true, hasAcceptedProposalOrQuotation: false }, "closed_won")).toBe(
			"Cannot advance: An accepted proposal or quotation is required first.",
		);
	});

	it("allows gated stages once the required lead evidence exists", () => {
		expect(getPipelineStageGateFailure({ ...baseLead, hasCompletedMeeting: true }, "proposal")).toBeNull();
		expect(getPipelineStageGateFailure({ ...baseLead, hasCompletedMeeting: true }, "quotation")).toBeNull();
		expect(getPipelineStageGateFailure({ ...baseLead, hasCompletedMeeting: true, hasAcceptedProposalOrQuotation: true }, "contract")).toBeNull();
		expect(getPipelineStageGateFailure({ ...baseLead, hasCompletedMeeting: true, hasAcceptedProposalOrQuotation: true }, "closed_won")).toBeNull();
	});
});
