import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectChangeRequestsTab } from "../ProjectChangeRequestsTab";
import { useAuthStore } from "@/entities/user/model/auth.store";
import type { ChangeRequest } from "@/features/projects/api/execution.api";

const changeRequests: ChangeRequest[] = [
	{
		changeRequestId: 15,
		projectId: 2,
		title: "Extra onboarding workshop",
		description: "Add a second workshop for client admins.",
		price: 750,
		status: "sent_to_client",
		statusLabel: "Sent to Client",
		createdAt: "2026-06-03T10:00:00.000Z",
		updatedAt: "2026-06-04T10:00:00.000Z",
	},
];

vi.mock("@/features/projects/api/execution.api", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/features/projects/api/execution.api")>();

	return {
		...actual,
		useChangeRequests: () => ({ data: changeRequests, isLoading: false, error: null }),
		useCreateChangeRequest: () => ({ mutateAsync: vi.fn(), isPending: false }),
		useUpdateChangeRequestStatus: () => ({ mutateAsync: vi.fn(), isPending: false }),
		useDeleteChangeRequest: () => ({ mutateAsync: vi.fn(), isPending: false }),
	};
});

describe("ProjectChangeRequestsTab", () => {
	it("renders only backend-supported status options", () => {
		useAuthStore.setState({
			user: { userId: 1, name: "Admin", email: "admin@example.test", avatar: "", role: "admin" },
			permissions: [
				{ permissionName: "manage_change_requests", access: true },
				{ permissionName: "delete_change_requests", access: true },
			],
		});

		render(
			<ProjectChangeRequestsTab
				projectId={2}
				currency="USD"
			/>,
		);

		expect(screen.getByRole("table")).toBeInTheDocument();
		expect(screen.getByText("Extra onboarding workshop")).toBeInTheDocument();

		const statusSelector = screen.getByRole("combobox", { name: "Update status" });
		const optionLabels = within(statusSelector)
			.getAllByRole("option")
			.map((option) => option.textContent);

		expect(optionLabels).toEqual(["Draft", "Sent to Client", "Approved", "Rejected"]);
	});
});
