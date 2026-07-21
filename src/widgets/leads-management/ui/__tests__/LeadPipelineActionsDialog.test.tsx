import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/shared/api/base";
import { useAuthStore } from "@/entities/user/model/auth.store";
import type { Lead } from "@/features/leads/model/types";
import { LeadPipelineActionsDialog } from "../LeadPipelineActionsDialog";

vi.mock("@/shared/api/base", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
	},
}));

const contract = {
	id: 3,
	status: "draft",
	creation_type: "direct_upload",
	file_path: "/api/v1/leads/17/documents/contract/3/download",
	file_name: "contract.pdf",
	created_at: "2026-07-21T09:00:00.000Z",
};

const lead: Lead = {
	id: 17,
	name: "Acme renewal",
	stage: "contract",
	createdAt: "2026-07-21T09:00:00.000Z",
	updatedAt: "2026-07-21T09:00:00.000Z",
};

describe("LeadPipelineActionsDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.setState({ permissions: [{ permissionName: "manage_leads", access: true }, { permissionName: "manage_contracts", access: true }] });
		vi.mocked(api.get).mockImplementation(async (url) => ({ data: { success: true, data: url.endsWith("/contracts") ? [contract] : [] } }));
		vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: { ...contract, status: "signed" } } });
	});

	it("keeps document lifecycle actions inside the Kanban command surface", async () => {
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
		render(
			<QueryClientProvider client={queryClient}>
				<LeadPipelineActionsDialog
					lead={lead}
					open
					onOpenChange={() => undefined}
				/>
			</QueryClientProvider>,
		);

		fireEvent.click(await screen.findByRole("button", { name: "Sign Contract #3" }));

		await waitFor(() => expect(api.post).toHaveBeenCalledWith("/leads/17/pipeline/contracts/3/sign"));
		expect(screen.getByText("Pipeline actions")).toBeInTheDocument();
	});

	it("offers conversion retry for a won lead inside the Kanban command surface", async () => {
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
		vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true, data: { client_name: "Acme", project_title: "Renewal" } } });

		render(
			<QueryClientProvider client={queryClient}>
				<LeadPipelineActionsDialog lead={{ ...lead, stage: "closed_won" }} open onOpenChange={() => undefined} />
			</QueryClientProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Retry conversion" }));

		await waitFor(() => expect(api.post).toHaveBeenCalledWith("/leads/17/convert"));
	});
});
