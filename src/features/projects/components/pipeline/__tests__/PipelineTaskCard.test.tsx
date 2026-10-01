import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DraggableTaskCard } from "../ProjectPipelineTab";
import type { PipelineTask, ProjectWorkflowStage } from "../../../types/pipeline";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("../../tasks/TaskWorkControls", () => ({ TaskWorkControls: () => <div>Work controls</div> }));
vi.mock("../../tasks/TaskDetailSheet", () => ({ TaskDetailSheet: () => null }));

const task: PipelineTask = {
	taskId: 12, projectId: 2, workflowStageId: 3, title: "Delivery task", priority: "high", position: 0,
	assignees: [{ userId: 7, name: "Avery", isPrimary: true }, { userId: 8, name: "Morgan" }],
	supervisorId: 9, supervisor: { userId: 9, name: "Sam Supervisor" }, totalTimeSpent: 95, estimatedHours: 3,
	holdReason: "Waiting for client assets",
};
const stage: ProjectWorkflowStage = { stageId: 3, name: "On hold", slug: "hold", color: "#F59E0B", category: "paused", position: 2, isTerminal: false, tasks: [task] };

describe("PipelineTaskCard", () => {
	it("shows named assignees, supervisor, work totals, status, and hold reason", () => {
		render(<DraggableTaskCard task={task} stage={stage} dragDisabled actions={{ canEdit: false, canDelete: false, canStartTimer: false, onOpen: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() }} />);
		expect(screen.getByText("Avery")).toBeInTheDocument();
		expect(screen.getByText("Morgan")).toBeInTheDocument();
		expect(screen.getByText("Sam Supervisor")).toBeInTheDocument();
		expect(screen.getByText("1h 35m / 3h planned")).toBeInTheDocument();
		expect(screen.getByText("On hold: Waiting for client assets")).toBeInTheDocument();
		expect(screen.getByText("On hold")).toBeInTheDocument();
	});

	it("opens task details even when the viewer cannot edit", () => {
		const onOpen = vi.fn();
		const onEdit = vi.fn();
		render(<DraggableTaskCard task={task} stage={stage} dragDisabled actions={{ canEdit: false, canDelete: false, canStartTimer: false, onOpen, onEdit, onDelete: vi.fn() }} />);
		fireEvent.click(screen.getByRole("button", { name: "Delivery task" }));
		expect(onOpen).toHaveBeenCalledOnce();
		expect(onEdit).not.toHaveBeenCalled();
	});
});
