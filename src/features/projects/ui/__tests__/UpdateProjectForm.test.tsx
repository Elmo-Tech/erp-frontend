import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectStatus, type Project } from "@/entities/project/model/types";
import { UpdateProjectForm } from "../UpdateProjectForm";

vi.mock("@/shared/api/base", () => ({
	default: {
		patch: vi.fn(),
	},
}));

const project: Project = {
	projectId: 31,
	clientId: 8,
	quotationId: null,
	title: "Website rebuild",
	description: "Existing scope",
	status: ProjectStatus.ACTIVE,
	previousStatus: ProjectStatus.DRAFT,
	budget: 12000,
	deadline: "2026-09-30",
	uiApprovedAt: null,
	createdAt: "2026-07-01T09:00:00Z",
	updatedAt: "2026-07-01T09:00:00Z",
	createdBy: 2,
	updatedBy: 2,
	client: {
		clientId: 8,
		name: "Acme",
		email: "owner@acme.test",
	},
};

describe("UpdateProjectForm", () => {
	it("keeps the conditional change-reason field inside the form context", () => {
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

		render(
			<QueryClientProvider client={queryClient}>
				<UpdateProjectForm open onOpenChange={vi.fn()} project={project} />
			</QueryClientProvider>,
		);

		fireEvent.change(screen.getByLabelText("Budget"), { target: { value: "15000" } });

		expect(screen.getByLabelText("Reason for change")).toBeInTheDocument();
		expect(screen.getByRole("dialog", { name: "Edit project" })).toBeInTheDocument();
	});
});
