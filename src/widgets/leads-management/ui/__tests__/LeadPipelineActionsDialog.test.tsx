import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/shared/api/base";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { leadKeys } from "@/features/leads/api/leads.api";
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
		Element.prototype.scrollIntoView = vi.fn();
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

	it("layers lead deletion confirmation above the pipeline actions dialog", async () => {
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

		render(
			<QueryClientProvider client={queryClient}>
				<LeadPipelineActionsDialog lead={lead} open onOpenChange={() => undefined} />
			</QueryClientProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Delete lead" }));

		const pipelineDialog = document.querySelector('[data-slot="dialog-content"]');
		const confirmationOverlay = document.querySelector('[data-slot="alert-dialog-overlay"]');
		const confirmationDialog = await screen.findByRole("alertdialog", { name: "Delete lead?" });

		expect(pipelineDialog).not.toBeNull();
		expect(pipelineDialog).toHaveClass("z-[60]");
		expect(confirmationOverlay).toHaveClass("z-[70]");
		expect(confirmationDialog).toHaveClass("z-[70]");
	});

	it("exposes a scheduled lead meeting so its status can be updated from Kanban", async () => {
		useAuthStore.setState({
			permissions: [
				{ permissionName: "manage_leads", access: true },
				{ permissionName: "schedule_meetings", access: true },
			],
		});
		const rawMeeting = {
			meetingId: 41,
			subjectId: 17,
			subjectType: "App\\Modules\\Lead\\Models\\Lead",
			meetingType: "discovery",
			status: "scheduled",
			title: "Discovery Call",
			location: "online",
			internalAttendees: [],
			externalAttendees: [],
			scheduledAt: "2026-07-22T09:00:00.000Z",
			createdAt: "2026-07-21T09:00:00.000Z",
			updatedAt: "2026-07-21T09:00:00.000Z",
		};
		vi.mocked(api.get).mockImplementation(async (url) => {
			if (url.startsWith("/meetings?")) {
				return {
					data: {
						success: true,
						data: {
							meetings: [rawMeeting],
							pagination: { total: 1, count: 1, perPage: 15, currentPage: 1, totalPages: 1 },
						},
					},
				};
			}

			return { data: { success: true, data: [] } };
		});
		vi.mocked(api.patch).mockResolvedValue({ data: { success: true, data: { ...rawMeeting, status: "completed", outcomeSummary: "Discovery completed." } } });
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
		queryClient.setQueryData(leadKeys.list(), [lead]);

		render(
			<QueryClientProvider client={queryClient}>
				<LeadPipelineActionsDialog lead={{ ...lead, stage: "meeting" }} open onOpenChange={() => undefined} />
			</QueryClientProvider>,
		);

		expect(await screen.findByText("Discovery Call")).toBeInTheDocument();
		fireEvent.pointerDown(screen.getByRole("button", { name: "Actions for Discovery Call" }), { button: 0, ctrlKey: false });
		fireEvent.click(await screen.findByText("Update Status"));
		fireEvent.click(screen.getByRole("combobox", { name: "New Status" }));
		fireEvent.click(await screen.findByRole("option", { name: "Completed" }));
		fireEvent.change(screen.getByRole("textbox", { name: /Completion Note/i }), { target: { value: "Discovery completed." } });
		fireEvent.click(screen.getByRole("button", { name: "Save Status" }));

		await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/meetings/41", { status: "completed", outcomeSummary: "Discovery completed." }));
		await waitFor(() => expect(queryClient.getQueryState(leadKeys.list())?.isInvalidated).toBe(true));
	});

	it.each([
		["proposals", "Proposal"],
		["quotations", "Quotation"],
		["contracts", "Contract"],
	])("does not expose %s task placeholders as document actions", async (resource, documentTitle) => {
		vi.mocked(api.get).mockImplementation(async (url) => ({
			data: {
				success: true,
				data: url.endsWith(`/${resource}`)
					? [{ id: 91, status: "draft", creation_type: "task", file_name: null, created_at: "2026-07-22T09:00:00.000Z" }]
					: [],
			},
		}));
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		const documentQueryKey = resource === "proposals" ? leadKeys.proposals(lead.id) : resource === "quotations" ? leadKeys.quotations(lead.id) : leadKeys.contracts(lead.id);

		render(
			<QueryClientProvider client={queryClient}>
				<LeadPipelineActionsDialog lead={lead} open onOpenChange={() => undefined} />
			</QueryClientProvider>,
		);

		await waitFor(() => expect(queryClient.getQueryState(documentQueryKey)?.status).toBe("success"));
		expect(screen.queryByText(`${documentTitle} #91`)).not.toBeInTheDocument();
	});
});
