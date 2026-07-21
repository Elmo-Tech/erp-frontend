import { describe, expect, it } from "vitest";
import { mapLeadResourceToLead, type RawLeadResource } from "../leads.api";

describe("lead API mappers", () => {
	it("maps backend lead stages to pipeline stages and preserves only stored fields", () => {
		const raw: RawLeadResource = {
			id: 9,
			title: "ERP discovery",
			stage: "new_lead",
			status: "active",
			company: "Acme",
			email: "lead@acme.test",
			phone: "+20100",
			expected_budget: 25000,
			source: "sales",
			assignedTo: 4,
			hasCompletedMeeting: true,
			hasAcceptedProposalOrQuotation: false,
			createdAt: "2026-06-01T10:00:00.000Z",
			updatedAt: "2026-06-02T10:00:00.000Z",
		};

		expect(mapLeadResourceToLead(raw)).toEqual({
			id: 9,
			name: "ERP discovery",
			company: "Acme",
			email: "lead@acme.test",
			phone: "+20100",
			stage: "new",
			assignedTo: 4,
			expectedBudget: 25000,
			source: "sales",
			hasCompletedMeeting: true,
			hasAcceptedProposalOrQuotation: false,
			createdAt: "2026-06-01T10:00:00.000Z",
			updatedAt: "2026-06-02T10:00:00.000Z",
		});
	});

	it("drops unknown backend stages instead of forcing them into the board", () => {
		expect(
			mapLeadResourceToLead({
				id: 10,
				title: "Unknown stage",
				stage: "archived",
				status: "inactive",
				company: null,
				email: null,
				phone: null,
				expected_budget: null,
				source: null,
				assignedTo: null,
				createdAt: "2026-06-01T10:00:00.000Z",
				updatedAt: "2026-06-02T10:00:00.000Z",
			}),
		).toBeNull();
	});
});
