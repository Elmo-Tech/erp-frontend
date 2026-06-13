import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectTeamTab } from "../ProjectTeamTab";
import { useAuthStore } from "@/entities/user/model/auth.store";

const projectMembers = [
	{
		memberId: 31,
		projectId: 2,
		userId: 7,
		role: "tech_lead",
		user: {
			userId: 7,
			name: "Mona Hassan",
			email: "mona@example.test",
			avatar: null,
		},
		createdAt: "2026-06-01T10:00:00.000Z",
	},
];

vi.mock("@/features/projects/api/execution.api", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/features/projects/api/execution.api")>();

	return {
		...actual,
		useProjectMembers: () => ({ data: projectMembers, isLoading: false, error: null }),
		useAddProjectMember: () => ({ mutateAsync: vi.fn(), isPending: false }),
		useRemoveProjectMember: () => ({ mutateAsync: vi.fn(), isPending: false }),
	};
});

vi.mock("@/entities/user/api/user.api", () => ({
	useGetInternalUsers: () => ({ data: { users: [] }, isLoading: false }),
}));

describe("ProjectTeamTab", () => {
	it("renders project members through the shared DataTable contract", () => {
		useAuthStore.setState({
			user: { userId: 1, name: "Admin", email: "admin@example.test", avatar: "", role: "admin" },
			permissions: [
				{ permissionName: "add_project_members", access: true },
				{ permissionName: "remove_project_members", access: true },
			],
		});

		render(<ProjectTeamTab projectId={2} />);

		expect(screen.getByRole("table")).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Member" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Email" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Role" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();
		expect(screen.getByText("Mona Hassan")).toBeInTheDocument();
		expect(screen.getByText("mona@example.test")).toBeInTheDocument();
		expect(screen.getByText("Tech Lead")).toBeInTheDocument();
	});
});
