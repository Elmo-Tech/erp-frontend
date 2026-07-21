import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import api from "@/shared/api/base";
import { useAuthStore } from "@/entities/user/model/auth.store";
import type { Lead } from "@/features/leads/model/types";
import { LeadDetailsSheet } from "../LeadDetailsSheet";

vi.mock("@/shared/api/base", () => ({
	default: {
		get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
	},
}));

const lead: Lead = {
	id: 17,
	name: "Acme renewal",
	company: "Acme",
	email: "buyer@acme.test",
	phone: "+201000000000",
	stage: "quotation",
	expectedBudget: 25000,
	createdAt: "2026-07-21T09:00:00.000Z",
	updatedAt: "2026-07-21T09:00:00.000Z",
};

describe("LeadDetailsSheet", () => {
	it("labels lead details as view-only and exposes no lifecycle controls", () => {
		useAuthStore.setState({ permissions: [{ permissionName: "manage_leads", access: true }, { permissionName: "manage_contracts", access: true }] });
		vi.mocked(api.get).mockImplementation(async (url) => ({ data: { success: true, data: url === "/leads/17" ? { id: 17, title: lead.name, stage: "quotation", status: "active", company: lead.company, email: lead.email, phone: lead.phone, expected_budget: lead.expectedBudget, source: null, assignedTo: null, createdAt: lead.createdAt, updatedAt: lead.updatedAt } : [] } }));
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

		render(
			<QueryClientProvider client={queryClient}>
				<LeadDetailsSheet
					lead={lead}
					open
					onOpenChange={() => undefined}
				/>
			</QueryClientProvider>,
		);

		expect(screen.getByText("View only")).toBeInTheDocument();
		expect(screen.getByText("Pipeline changes are managed from the Kanban board.")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /advance|move to|delete|sign|add proposal|add quotation|add contract/i })).not.toBeInTheDocument();
	});
});
