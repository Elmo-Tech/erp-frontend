import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

vi.mock("@/features/admin/hooks/usePermissions", () => ({
	usePermissions: () => ({
		canEditProjects: false,
		canViewTasks: true,
		canViewProjectMembers: true,
		canViewProjectFiles: true,
		canViewWiki: true,
		canViewProjectHistory: true,
		canViewProjectBudget: false,
		canViewChangeRequests: false,
	}),
}));

vi.mock("@/components/shared/StatusBadge", () => ({
	ProjectStatusBadge: () => <span>Status</span>,
}));

vi.mock("../tabs", () => ({
	TeamTab: () => <div>Team tab</div>,
	TasksTab: () => <div>Tasks tab</div>,
	WikiTab: () => <div>Wiki tab</div>,
	FilesTab: () => <div>Files tab</div>,
	HistoryTab: () => <div>History tab</div>,
	ChangeRequestsTab: () => <div>CR tab</div>,
}));

describe("ProjectDetailsTabs", () => {
	it("shows the project Wiki tab when the user can view wiki", () => {
		render(<ProjectDetailsTabs projectId={1} />);

		expect(screen.getByRole("tab", { name: /wiki/i })).toBeInTheDocument();
	});
});
