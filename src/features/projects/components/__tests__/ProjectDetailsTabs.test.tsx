import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectDetailsTabs } from "../ProjectDetailsTabs";
import { ProjectStatus } from "@/features/projects/types/project";

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("../../hooks/useProjects", () => ({
	useUpdateProject: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useProject: () => ({
		isLoading: false,
		data: {
			projectId: 1,
			clientId: 1,
			quotationId: null,
			title: "QA Project",
			description: "",
			status: ProjectStatus.ACTIVE,
			previousStatus: null,
			budget: 100,
			deadline: null,
			uiApprovedAt: null,
			tasks: [],
			members: [],
			files: [],
			createdAt: "2026-07-05T00:00:00.000Z",
			updatedAt: "2026-07-05T00:00:00.000Z",
			createdBy: null,
			updatedBy: null,
		},
	}),
}));

let isAdminWorkspace = true;

vi.mock("@/features/admin/hooks/usePermissions", () => ({
	usePermissions: () => ({
		canManageProjects: isAdminWorkspace,
		canEditProjects: false,
		canViewTasks: true,
		canViewProjectFiles: true,
		canViewProjectHistory: true,
		canViewProjectBudget: false,
	}),
}));

vi.mock("@/components/shared/StatusBadge", () => ({
	ProjectStatusBadge: () => <span>Status</span>,
}));

vi.mock("../tabs", () => ({
	FilesTab: () => <div>Files tab</div>,
	HistoryTab: () => <div>History tab</div>,
}));

vi.mock("../pipeline", () => ({
	ProjectPipelineTab: () => <div>Pipeline board</div>,
}));

vi.mock("../projects", () => ({
	UpdateProjectForm: () => null,
}));

describe("ProjectDetailsTabs", () => {
	beforeEach(() => {
		isAdminWorkspace = true;
	});

	it("opens the pipeline first and keeps only the streamlined admin tabs", () => {
		render(<ProjectDetailsTabs projectId={1} />);

		expect(screen.getByRole("tab", { name: /pipeline/i })).toHaveAttribute("data-state", "active");
		expect(screen.getByText("Pipeline board")).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: /files/i })).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: /history/i })).toBeInTheDocument();
		expect(screen.queryByRole("tab", { name: /legacy tasks/i })).not.toBeInTheDocument();
		expect(screen.queryByRole("tab", { name: /wiki/i })).not.toBeInTheDocument();
	});

	it("shows assigned-project users only the pipeline tab", () => {
		isAdminWorkspace = false;

		render(<ProjectDetailsTabs projectId={1} />);

		expect(screen.getAllByRole("tab")).toHaveLength(1);
		expect(screen.getByRole("tab", { name: /pipeline/i })).toBeInTheDocument();
		expect(screen.getByText("Pipeline board")).toBeInTheDocument();
	});
});
