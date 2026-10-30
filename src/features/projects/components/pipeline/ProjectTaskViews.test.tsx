import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ProjectTaskDashboard, ProjectTaskList } from "./ProjectTaskViews";
import type { ProjectWorkflowStage } from "../../types/pipeline";

const stages = [
 { stageId: 1, name: "Working", category: "active", isTerminal: false, tasks: [{ taskId: 1, title: "Design page", priority: "high", dueDate: "2026-11-01", assignees: [{ userId: 1, name: "Aya" }, { userId: 2, name: "Omar" }] }, { taskId: 2, title: "Unassigned task", priority: "medium", assignees: [] }] },
 { stageId: 2, name: "Done", category: "done", isTerminal: true, tasks: [{ taskId: 3, title: "Delivered", priority: "low", assignees: [{ userId: 1, name: "Aya" }] }] },
] as unknown as ProjectWorkflowStage[];

it("groups, searches, opens and creates tasks in the selected stage", () => {
 const open = vi.fn(); const create = vi.fn();
 render(<ProjectTaskList stages={stages} onOpen={open} onCreate={create} canCreate />);
 fireEvent.change(screen.getByRole("textbox", { name: "Search project tasks" }), { target: { value: "aya" } });
 expect(screen.getByText("Design page")).toBeInTheDocument();
 expect(screen.getByText("Delivered")).toBeInTheDocument();
 expect(screen.queryByText("Unassigned task")).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole("button", { name: "Design page" }));
 expect(open).toHaveBeenCalledWith(stages[0].tasks[0]);
 fireEvent.click(screen.getAllByRole("button", { name: /Add task/ })[0]);
 expect(create).toHaveBeenCalledWith(stages[0]);
});

it("counts tasks once overall and separately for each assignee", () => {
 render(<ProjectTaskDashboard stages={stages} />);
 expect(screen.getByText("3")).toBeInTheDocument();
 expect(screen.getByText("2 total · 1 open · 1 completed")).toBeInTheDocument();
 expect(screen.getByText("1 total · 1 open · 0 completed")).toBeInTheDocument();
 expect(screen.getByText("Done: 1")).toBeInTheDocument();
});
