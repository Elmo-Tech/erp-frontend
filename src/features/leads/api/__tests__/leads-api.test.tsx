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
});
