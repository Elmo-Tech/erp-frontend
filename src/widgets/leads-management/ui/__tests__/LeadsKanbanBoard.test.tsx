import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { usePipelineStore } from "@/features/leads/model/usePipelineStore";
import type { Lead } from "@/features/leads/model/types";
import { LeadsKanbanBoard } from "../LeadsKanbanBoard";

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/shared/api/base", () => ({
	default: {
		get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
		post: vi.fn(),
	},
}));

const mockedApi = api as unknown as { get: Mock; post: Mock };

const lead: Lead = {
	id: 7,
	name: "Acme",
	stage: "proposal",
	hasCompletedMeeting: true,
	hasAcceptedProposalOrQuotation: true,
	createdAt: "2026-07-01T00:00:00Z",
	updatedAt: "2026-07-01T00:00:00Z",
};

describe("LeadsKanbanBoard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		usePipelineStore.getState()._resetDragState();
	});

	it("asks for the completed task document before starting the next transition", async () => {
		mockedApi.get.mockResolvedValue({
			data: {
				success: true,
				data: {
					stage: "proposal",
					document_type: "proposal",
					has_task: true,
					task_status: "done",
					has_document: false,
					task_must_be_completed: false,
					requires_document_upload: true,
				},
			},
		});
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

		render(
			<QueryClientProvider client={queryClient}>
				<LeadsKanbanBoard
					leads={[lead]}
					canEdit
					canConvert
					canCreateQuotations
					canCreateContracts
					canManagePipelineActions
				/>
			</QueryClientProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Move Acme to Quotation" }));

		expect(await screen.findByText("Upload the completed Proposal document before moving the lead forward.")).toBeInTheDocument();
		expect(screen.queryByRole("tab", { name: "Task" })).not.toBeInTheDocument();
	});
});
