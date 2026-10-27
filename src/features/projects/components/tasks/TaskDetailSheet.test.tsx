import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskDetailSheet } from "./TaskDetailSheet";

const queries = vi.hoisted(() => ({ useTask: vi.fn(), useTestScenarios: vi.fn() }));
vi.mock("@/features/dashboard/hooks/useTasks", () => ({
	useTask: queries.useTask,
	useTestScenarios: queries.useTestScenarios,
	useTaskActivities: () => ({ data: [] }),
}));
vi.mock("@/features/admin/hooks/usePermissions", () => ({ usePermissions: () => ({}) }));
vi.mock("@/components/shared/StatusBadge", () => ({ TaskStatusBadge: () => null, TaskTypeBadge: () => null, TaskPriorityBadge: () => null, TaskCategoryBadge: () => null }));
vi.mock("./TaskAssigneesSection", () => ({ TaskAssigneesSection: () => null }));
vi.mock("./TaskActivitySection", () => ({ TaskActivitySection: () => null }));
vi.mock("./TaskTimerWidget", () => ({ TaskTimerWidget: () => null }));
vi.mock("./TaskTimeEntriesSection", () => ({ TaskTimeEntriesSection: () => null }));
vi.mock("./TaskSupervisionSection", () => ({ TaskSupervisionSection: () => null }));
vi.mock("./TaskTestScenariosSection", () => ({ TaskTestScenariosSection: () => <div>Existing test scenarios</div> }));

const task = {
	taskId: 12, title: "Delivery task", isPipelineTask: true, estimatedHours: 3, totalTimeSpent: 95,
	testCompletionPercentage: 0, canStartTimer: false, assignees: [], deliveryStatus: { isCompleted: false },
};

describe("TaskDetailSheet tests visibility", () => {
	beforeEach(() => {
		queries.useTask.mockReturnValue({ data: task, isLoading: false });
		queries.useTestScenarios.mockReturnValue({ data: [] });
	});

	it.each([true, false])("keeps an accessible title and description before a task is available (loading=%s)", (isLoading) => {
		queries.useTask.mockReturnValue({ data: undefined, isLoading });
		const error = vi.spyOn(console, "error");
		const warn = vi.spyOn(console, "warn");
		render(<TaskDetailSheet taskId={12} open onOpenChange={vi.fn()} />);
		expect(screen.getByRole("dialog", { name: isLoading ? "Loading task details" : "Task not found" })).toHaveAccessibleDescription();
		expect(error).not.toHaveBeenCalled();
		expect(warn).not.toHaveBeenCalled();
		error.mockRestore();
		warn.mockRestore();
	});

	it("hides the Tests tab and statistic when the task has no test scenarios", () => {
		render(<TaskDetailSheet taskId={12} open onOpenChange={vi.fn()} />);
		expect(screen.queryByRole("tab", { name: /Tests/ })).not.toBeInTheDocument();
		expect(screen.queryByText("Tests")).not.toBeInTheDocument();
		expect(screen.getAllByRole("tab")).toHaveLength(5);
		expect(screen.getByText("Time Spent")).toBeInTheDocument();
	});

	it("keeps existing tests accessible and returns to details when the last scenario is removed", () => {
		queries.useTestScenarios.mockReturnValue({ data: [{ scenarioId: 1 }] });
		const view = render(<TaskDetailSheet taskId={12} open onOpenChange={vi.fn()} />);
		fireEvent.mouseDown(screen.getByRole("tab", { name: "Tests (1)" }), { button: 0, ctrlKey: false });
		expect(screen.getByText("Existing test scenarios")).toBeInTheDocument();
		queries.useTestScenarios.mockReturnValue({ data: [] });
		view.rerender(<TaskDetailSheet taskId={12} open onOpenChange={vi.fn()} />);
		expect(screen.queryByRole("tab", { name: /Tests/ })).not.toBeInTheDocument();
		expect(screen.getByRole("tab", { name: "Details" })).toHaveAttribute("data-state", "active");
	});
});
