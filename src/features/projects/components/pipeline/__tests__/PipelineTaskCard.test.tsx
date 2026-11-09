import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DraggableTaskCard } from "../ProjectPipelineTab";
import type { PipelineTask, ProjectWorkflowStage } from "../../../types/pipeline";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
const workAction = vi.hoisted(() => vi.fn());
vi.mock("../../tasks/TaskWorkControls", () => ({ TaskWorkControls: () => <button onClick={workAction}>Start work</button> }));
vi.mock("../../tasks/TaskDetailSheet", () => ({ TaskDetailSheet: () => null }));

const task: PipelineTask = {
	taskId: 12, projectId: 2, workflowStageId: 3, title: "Delivery task", priority: "high", position: 0,
	assignees: [{ userId: 7, name: "Avery", isPrimary: true }, { userId: 8, name: "Morgan" }],
	supervisorId: 9, supervisor: { userId: 9, name: "Sam Supervisor" }, totalTimeSpent: 95, estimatedHours: 3,
	holdReason: "Waiting for client assets",
};
const stage: ProjectWorkflowStage = { stageId: 3, name: "On hold", slug: "hold", color: "#F59E0B", category: "paused", position: 2, isTerminal: false, tasks: [task] };

describe("PipelineTaskCard", () => {
	beforeEach(() => vi.clearAllMocks());

	it("keeps assignees, supervisor, and work time in compact rows without a details footer", () => {
		render(<DraggableTaskCard task={task} stage={stage} dragDisabled actions={{ canEdit: false, canDelete: false, canStartTimer: false, onOpen: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() }} />);
		expect(screen.getByText("Delivery task")).toHaveStyle({ color: "#F59E0B" });
		expect(screen.getByText("Avery, Morgan")).toBeInTheDocument();
		expect(screen.getByText("Sam Supervisor")).toBeInTheDocument();
		expect(screen.getByLabelText("1h 35m logged of 3h estimated")).toHaveTextContent("1h 35m / 3h");
		expect(screen.queryByText("Logged work")).not.toBeInTheDocument();
		expect(screen.queryByText("Open task details")).not.toBeInTheDocument();
		expect(screen.getByText("On hold: Waiting for client assets")).toBeInTheDocument();
		expect(screen.getByText("On hold")).toBeInTheDocument();
	});

	it("opens task details even when the viewer cannot edit", () => {
		const onOpen = vi.fn();
		const onEdit = vi.fn();
		render(<DraggableTaskCard task={task} stage={stage} dragDisabled actions={{ canEdit: false, canDelete: false, canStartTimer: false, onOpen, onEdit, onDelete: vi.fn() }} />);
		const cardOpener = screen.getByRole("button", { name: "Open task details: Delivery task" });
		expect(cardOpener).toHaveClass("absolute", "inset-0");
		fireEvent.click(cardOpener);
		expect(onOpen).toHaveBeenCalledOnce();
		expect(onEdit).not.toHaveBeenCalled();
	});

	it("does not open details when using work controls, dragging, or the task menu", () => {
		const onOpen = vi.fn();
		const onEdit = vi.fn();
		render(<DraggableTaskCard task={task} stage={stage} dragDisabled={false} actions={{ canEdit: true, canDelete: true, canStartTimer: true, onOpen, onEdit, onDelete: vi.fn() }} />);
		fireEvent.click(screen.getByRole("button", { name: "Start work" }));
		expect(workAction).toHaveBeenCalledOnce();
		fireEvent.click(screen.getByRole("button", { name: "Drag Delivery task" }));
		fireEvent.keyDown(screen.getByRole("button", { name: "Actions for Delivery task" }), { key: "ArrowDown" });
		fireEvent.click(screen.getByRole("menuitem", { name: "Edit task" }));
		expect(onEdit).toHaveBeenCalledOnce();
		expect(onOpen).not.toHaveBeenCalled();
	});
});
