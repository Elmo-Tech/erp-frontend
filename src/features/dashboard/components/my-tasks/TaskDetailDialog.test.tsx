import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { TaskDetailDialog } from "./TaskDetailDialog";
import { Task, TaskPriority, TaskStatus, TaskType } from "../../types/task";

vi.mock("./useMyTaskAccess", () => ({ useMyTaskAccess: () => ({ canEdit: () => false }) }));
vi.mock("@/features/sales/hooks", () => ({ useStartTimer: () => ({}), useStopTimer: () => ({}) }));
vi.mock("@/store/timerStore", () => ({ useTimerStore: () => ({ activeTimer: null }) }));
vi.mock("@/features/projects/components/tasks/TaskSupervisionSection", () => ({ TaskSupervisionSection: () => null }));

it("gives the My Tasks details dialog an accessible description without warnings", () => {
 const warn = vi.spyOn(console, "warn");
 const task = { taskId: 12, title: "QA completed task", status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, type: TaskType.MAIN, children: [], assignees: [], canStartTimer: false } as unknown as Task;
 render(<TaskDetailDialog task={task} onClose={vi.fn()} onStatusChange={vi.fn()} />);
 expect(screen.getByRole("dialog", { name: "QA completed task" })).toHaveAccessibleDescription("Task details, assigned employees, supervision, and time tracking.");
 expect(screen.getByRole("combobox")).toBeDisabled();
 expect(warn).not.toHaveBeenCalled();
 warn.mockRestore();
});
