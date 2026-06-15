import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PersonalTasksSummaryCard } from "../PersonalTasksSummaryCard";

vi.mock("@/features/personal-tasks/api/personal-tasks.api", () => ({
	useActivePersonalTimeEntry: () => ({
		data: {
			personalTaskId: 2,
			startTime: "2026-06-15T09:00:00.000Z",
		},
		isLoading: false,
	}),
	usePersonalTasks: () => ({
		data: [
			{ taskId: 1, title: "Plan invoices", status: "todo", totalLoggedMinutes: 15 },
			{ taskId: 2, title: "Review payroll", status: "in_progress", totalLoggedMinutes: 30 },
			{ taskId: 3, title: "Archive notes", status: "done", totalLoggedMinutes: 10 },
		],
		isLoading: false,
	}),
}));

describe("PersonalTasksSummaryCard", () => {
	it("summarizes personal tasks without rendering the growing task list", () => {
		render(<PersonalTasksSummaryCard />);

		expect(screen.getByText("Personal Tasks")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
		expect(screen.getByText("Open")).toBeInTheDocument();
		expect(screen.getByText("1")).toBeInTheDocument();
		expect(screen.getByText("Done")).toBeInTheDocument();
		expect(screen.getByText("45m")).toBeInTheDocument();
		expect(screen.getByText("Review payroll")).toBeInTheDocument();
		expect(screen.queryByText("Plan invoices")).not.toBeInTheDocument();
		expect(screen.getByRole("link", { name: /open my tasks/i })).toHaveAttribute("href", "/dashboard/my-tasks");
	});
});
