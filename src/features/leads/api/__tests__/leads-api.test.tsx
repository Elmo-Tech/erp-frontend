import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { createLeadProposal, leadKeys, updateLeadQuotationStatus, updateLeadStage, useCreateLeadProposal } from "../leads.api";

vi.mock("@/shared/api/base", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
	},
}));

const mockedApi = api as unknown as {
	post: Mock;
	patch: Mock;
};

describe("leads API", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("creates a lead proposal through the lead proposals endpoint", async () => {
		mockedApi.post.mockResolvedValueOnce({ data: { success: true, data: { id: 9 } } });

		await expect(createLeadProposal(7, { creation_type: "direct_upload" })).resolves.toEqual({ success: true, data: { id: 9 } });

		expect(mockedApi.post).toHaveBeenCalledWith("/leads/7/proposals", { creation_type: "direct_upload" });
	});

	it("creates a lead document with its selected upload file", async () => {
		mockedApi.post.mockResolvedValueOnce({ data: { success: true, data: { id: 9 } } });
		const document = new File(["%PDF"], "proposal.pdf", { type: "application/pdf" });

		await createLeadProposal(7, { creation_type: "direct_upload", upload_file: document });

		const [endpoint, body] = mockedApi.post.mock.calls[0] as [string, FormData];
		expect(endpoint).toBe("/leads/7/proposals");
		expect(body).toBeInstanceOf(FormData);
		expect(body.get("creation_type")).toBe("direct_upload");
		expect(body.get("upload_file")).toBe(document);
	});

	it("invalidates the exact proposals query key after creating a proposal", async () => {
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
		mockedApi.post.mockResolvedValueOnce({ data: { success: true, data: { id: 10 } } });

		const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
		const { result } = renderHook(() => useCreateLeadProposal(7), { wrapper });

		result.current.mutate({ creation_type: "direct_upload" });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: leadKeys.proposals(7) });
	});

	it("updates quotation status through the lead quotation endpoint", async () => {
		mockedApi.patch.mockResolvedValueOnce({ data: { success: true, data: { id: 11, status: "accepted" } } });

		await expect(updateLeadQuotationStatus(7, 11, "accepted")).resolves.toEqual({ success: true, data: { id: 11, status: "accepted" } });

		expect(mockedApi.patch).toHaveBeenCalledWith("/leads/7/quotations/11", { status: "accepted" });
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
});
