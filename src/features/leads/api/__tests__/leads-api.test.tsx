import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { deleteLead, getLeadPipelineReadiness, getProposalTemplates, updateLeadQuotationStatus, updateLeadStage } from "../leads.api";

vi.mock("@/shared/api/base", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

const mockedApi = api as unknown as {
	get: Mock;
	post: Mock;
	patch: Mock;
	delete: Mock;
};

describe("leads API", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("loads the proposal template catalog from the backend", async () => {
		const templates = [{ id: 1, name: "Standard Proposal", description: "General projects" }];
		mockedApi.get.mockResolvedValueOnce({ data: { success: true, data: templates } });

		await expect(getProposalTemplates()).resolves.toEqual(templates);
		expect(mockedApi.get).toHaveBeenCalledWith("/lead-proposal-templates");
	});

	it("loads the current document-task readiness for a lead", async () => {
		const readiness = {
			stage: "proposal",
			document_type: "proposal" as const,
			has_task: true,
			task_status: "done",
			has_document: false,
			task_must_be_completed: false,
			requires_document_upload: true,
		};
		mockedApi.get.mockResolvedValueOnce({ data: { success: true, data: readiness } });

		await expect(getLeadPipelineReadiness(7)).resolves.toEqual(readiness);
		expect(mockedApi.get).toHaveBeenCalledWith("/leads/7/pipeline/readiness");
	});

	it("updates quotation status through the Kanban pipeline endpoint", async () => {
		mockedApi.patch.mockResolvedValueOnce({ data: { success: true, data: { id: 11, status: "accepted" } } });

		await expect(updateLeadQuotationStatus(7, 11, "accepted")).resolves.toEqual({ success: true, data: { id: 11, status: "accepted" } });

		expect(mockedApi.patch).toHaveBeenCalledWith("/leads/7/pipeline/quotations/11", { status: "accepted" });
	});

	it("deletes leads through the Kanban pipeline endpoint", async () => {
		mockedApi.delete.mockResolvedValueOnce({ data: { success: true } });

		await deleteLead(7);

		expect(mockedApi.delete).toHaveBeenCalledWith("/leads/7/pipeline");
	});

	it("sends scheduled meeting data separately from document stage results", async () => {
		mockedApi.post.mockResolvedValueOnce({ data: { success: true, data: { id: 7, stage: "meeting" } } });

		await updateLeadStage(7, "meeting", [
			{
				stage: "meeting",
				payload: {
					mode: "schedule",
					meeting_type: "discovery",
					date: "2026-05-01",
					time: "10:30",
					location_type: "online",
					location_details: "",
					internal_attendees: ["3"],
					external_attendees: ["primary-contact"],
					notes: "Backfilled discovery notes.",
				},
			},
		]);

		expect(mockedApi.post).toHaveBeenCalledWith("/leads/7/stage", {
			new_stage: "meeting",
			stage_results: [],
			scheduled_meeting: {
				meeting_type: "discovery",
				date: "2026-05-01",
				time: "10:30",
				location_type: "online",
				location_details: "",
				internal_attendees: ["3"],
				external_attendees: ["primary-contact"],
				notes: "Backfilled discovery notes.",
			},
		});
	});

	it("identifies the completed stage in each document result", async () => {
		mockedApi.post.mockResolvedValueOnce({ data: { success: true, data: { id: 7, stage: "proposal" } } });

		await updateLeadStage(7, "proposal", [
			{
				stage: "proposal",
				payload: {
					mode: "task",
					assignedTo: 3,
					deadline: "2026-08-01",
					notes: "Prepare the proposal.",
				},
			},
		]);

		expect(mockedApi.post).toHaveBeenCalledWith("/leads/7/stage", {
			new_stage: "proposal",
			stage_results: [
				{
					stage: "proposal",
					type: "proposal",
					creation_type: "task",
					assigned_to: 3,
					due_date: "2026-08-01",
					notes: "Prepare the proposal.",
				},
			],
		});
	});

	it("sends direct-upload documents as multipart stage evidence", async () => {
		mockedApi.post.mockResolvedValueOnce({ data: { success: true, data: { id: 7, stage: "meeting" } } });
		const document = new File(["%PDF-private-content"], "discovery-proposal.pdf", { type: "application/pdf" });

		await updateLeadStage(7, "meeting", [
			{
				stage: "meeting",
				payload: {
					mode: "direct_upload",
					upload_file: document,
					notes: "Discovery proposal.",
				},
			},
		]);

		const [endpoint, body] = mockedApi.post.mock.calls[0] as [string, FormData];
		expect(endpoint).toBe("/leads/7/stage");
		expect(body).toBeInstanceOf(FormData);
		expect(body.get("new_stage")).toBe("meeting");
		expect(body.get("stage_results[0][stage]")).toBe("meeting");
		expect(body.get("stage_results[0][type]")).toBe("proposal");
		expect(body.get("stage_results[0][creation_type]")).toBe("direct_upload");
		expect(body.get("stage_results[0][upload_file]")).toBe(document);
		expect(body.get("stage_results[0][notes]")).toBe("Discovery proposal.");
	});

	it("sends the selected proposal template as stage evidence", async () => {
		mockedApi.post.mockResolvedValueOnce({ data: { success: true, data: { id: 7, stage: "proposal" } } });

		await updateLeadStage(7, "proposal", [
			{
				stage: "proposal",
				payload: {
					mode: "direct_upload",
					proposal_source: "use_template",
					template_id: 3,
					validity_date: "2026-09-30",
					notes: "Annual subscription with guided onboarding.",
				},
			},
		]);

		expect(mockedApi.post).toHaveBeenCalledWith("/leads/7/stage", {
			new_stage: "proposal",
			stage_results: [
				{
					stage: "proposal",
					type: "proposal",
					creation_type: "direct_upload",
					proposal_source: "use_template",
					template_id: 3,
					validity_date: "2026-09-30",
					notes: "Annual subscription with guided onboarding.",
				},
			],
		});
	});
});
