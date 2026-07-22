import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ModalQueueItem } from "@/features/leads/model/types";
import { StageModal } from "../StageModal";

vi.mock("@/shared/api/base", () => ({
	default: {
		get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
	},
}));

describe("StageModal", () => {
	it("requires a document upload when fulfilling a completed stage task", () => {
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		const item = {
			stage: "proposal",
			isIntermediateSkip: false,
			requiresDocumentUpload: true,
		} as ModalQueueItem;

		render(
			<QueryClientProvider client={queryClient}>
				<StageModal item={item} onSubmit={vi.fn()} onCancel={vi.fn()} />
			</QueryClientProvider>,
		);

		expect(screen.queryByRole("tab", { name: "Task" })).not.toBeInTheDocument();
		expect(screen.queryByRole("tab", { name: "Skip" })).not.toBeInTheDocument();
		expect(screen.getByText("Upload the completed Proposal document before moving the lead forward.")).toBeInTheDocument();
	});
});
