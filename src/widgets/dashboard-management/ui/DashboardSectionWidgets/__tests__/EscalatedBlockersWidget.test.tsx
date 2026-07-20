import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { EscalatedBlockersWidget } from "../EscalatedBlockersWidget";

const mutation = {
	mutate: vi.fn(),
	isPending: false,
	variables: undefined,
};

vi.mock("@/widgets/dashboard-management/model/dashboard.api", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/widgets/dashboard-management/model/dashboard.api")>();

	return {
		...actual,
		useResolveEscalatedBlocker: () => mutation,
	};
});

const blocker = {
	id: 4,
	dependency_id: 4,
	task_id: 9,
	title: "Blocked release",
	project: "Business OS",
	blocked_by: { task_id: 8, title: "Pending migration", status: "in_progress" },
	escalated_at: "2026-07-16T10:00:00.000Z",
};

describe("EscalatedBlockersWidget", () => {
	beforeEach(() => {
		useAuthStore.setState({ permissions: [] });
	});

	it("keeps read-only viewers from resolving blockers", () => {
		render(<EscalatedBlockersWidget blockers={[blocker]} />);

		expect(screen.getByText("Blocked release")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /resolve/i })).not.toBeInTheDocument();
	});

	it("shows resolve only with the dedicated mutation permission", () => {
		useAuthStore.setState({
			permissions: [{ permissionName: "resolve_blockers", access: true }],
		});

		render(<EscalatedBlockersWidget blockers={[blocker]} />);

		expect(screen.getByRole("button", { name: /resolve/i })).toBeInTheDocument();
	});
});
