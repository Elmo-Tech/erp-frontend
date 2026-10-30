import { fireEvent, render, screen } from "@testing-library/react";
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
			projectTypeId: 3,
			quotationId: null,
			title: "QA Project",
			description: "",
			status: ProjectStatus.ACTIVE,
			previousStatus: null,
			budget: 100,
			deadline: "2026-07-31T00:00:00.000Z",
			projectType: { projectTypeId: 3, label: "Website", value: "website" },
			progress: 40,
			totalTimeSpent: 125,
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
let canViewProjectTasks = true;

vi.mock("@/features/admin/hooks/usePermissions", () => ({
	usePermissions: () => ({
		canManageProjects: isAdminWorkspace,
		canEditProjects: false,
		canViewTasks: canViewProjectTasks,
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
		canViewProjectTasks = true;
	});

	it("opens the work area directly and keeps project sections in the menu", () => {
		render(<ProjectDetailsTabs projectId={1} />);
		expect(screen.getByText("Pipeline board")).toBeInTheDocument();
		expect(screen.queryByRole("tab", { name: /pipeline/i })).not.toBeInTheDocument();
		expect(screen.queryByRole("tab", { name: /overview/i })).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Open project menu" }));
		expect(screen.getByRole("dialog", { name: "Project menu" })).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: /files/i })).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: /history/i })).toBeInTheDocument();
		expect(screen.queryByRole("tab", { name: /wiki/i })).not.toBeInTheDocument();
	});

	it("shows project metrics inside the menu and returns to the work area on close", () => {
		render(<ProjectDetailsTabs projectId={1} />);
		expect(screen.queryByText("Deadline")).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Open project menu" }));
		expect(screen.getByText("Deadline")).toBeInTheDocument();
		expect(screen.getByText("Jul 31, 2026")).toBeInTheDocument();
		expect(screen.getByText("40%")).toBeInTheDocument();
		expect(screen.getByText("2h 5m")).toBeInTheDocument();
		expect(screen.getByText("Website")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		expect(screen.getByText("Pipeline board")).toBeInTheDocument();
	});

	it("does not expose the project menu to assigned-project users without management permission", () => {
		isAdminWorkspace = false;
		render(<ProjectDetailsTabs projectId={1} />);
		expect(screen.getByText("Pipeline board")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Open project menu" })).not.toBeInTheDocument();
	});

	it("keeps the menu accessible when project management is available without task access", () => {
		canViewProjectTasks = false;
		render(<ProjectDetailsTabs projectId={1} />);
		expect(screen.queryByText("Pipeline board")).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Open project menu" }));
		expect(screen.getByText("Deadline")).toBeInTheDocument();
	});
});
