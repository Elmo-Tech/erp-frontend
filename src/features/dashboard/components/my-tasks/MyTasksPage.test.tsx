import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MyTasksPage } from "./MyTasksPage";
import { Task, TaskStatus, TaskType } from "../../types/task";

const state = vi.hoisted(() => ({ tasks: [] as Task[], permissions: {} as Record<string, boolean>, update: vi.fn(), createRendered: vi.fn() }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock("@/store/authStore", () => ({ useAuthStore: () => ({ user: { userId: 13 } }) }));
vi.mock("@/features/admin/hooks/usePermissions", () => ({ usePermissions: () => state.permissions }));
vi.mock("../../hooks/useTasks", () => ({ useMyAssignedTasks: () => ({ data: { tasks: state.tasks }, isLoading: false }), useUpdateTask: () => ({ mutateAsync: state.update }) }));
vi.mock("@/features/projects/hooks/useProjects", () => ({ useProjects: () => ({ data: { projects: [] } }) }));
vi.mock("./StatsCard", () => ({ StatsCard: ({ label, value }: { label: string; value: number }) => <div>{label}:{value}</div> }));
vi.mock("./TaskFilters", () => ({ TaskFiltersBar: ({ onSearchChange, onViewChange }: { onSearchChange: (value: string) => void; onViewChange: (value: string) => void }) => <><input aria-label="Search tasks" onChange={e => onSearchChange(e.target.value)} /><button onClick={() => onViewChange("list")}>List</button></> }));
vi.mock("./KanbanView", () => ({
 KanbanView: ({ tasksByStatus, onStatusChange }: { tasksByStatus: Record<TaskStatus, Task[]>; onStatusChange: (task: Task, status: TaskStatus) => void }) => <div>{Object.values(tasksByStatus).flat().map(task => <div key={task.taskId}>Board: {task.title}<button onClick={() => onStatusChange(task, TaskStatus.TODO)}>Attempt status change</button></div>)}</div>,
 TaskCardOverlay: () => null,
}));
vi.mock("./ListView", () => ({ ListView: ({ tasks }: { tasks: Task[] }) => <div>{tasks.map(task => <div key={task.taskId}>List: {task.title}</div>)}</div> }));
vi.mock("./TaskDetailDialog", () => ({ TaskDetailDialog: () => null }));
vi.mock("./CreateTaskDialog", () => ({ CreateTaskDialog: () => { state.createRendered(); return <div>Create form</div>; } }));

const completed = { taskId: 12, title: "Completed QA task", type: TaskType.MAIN, status: TaskStatus.COMPLETED, hasChildren: false, canStartTimer: false, children: [], isPipelineTask: true } as unknown as Task;
const restrictedPermissions: Record<string, boolean>[] = [{}, { canCreateSubtasks: true }, { canCreateWeeklyTasks: true }];
describe("My Tasks production regressions", () => {
 beforeEach(() => { state.tasks = [completed]; state.permissions = {}; state.update.mockReset(); state.createRendered.mockReset(); });
 it("includes completed non-timer tasks in Board and Done count, matching List", () => {
  render(<MyTasksPage />);
  expect(screen.getByText("Board: Completed QA task")).toBeInTheDocument();
  expect(screen.getByText("Done:1")).toBeInTheDocument();
  expect(screen.getByText("Total:1")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "List" }));
  expect(screen.getByText("List: Completed QA task")).toBeInTheDocument();
 });
 it("shows a completed nested leaf once even when also returned as a root", () => {
  state.tasks = [{ ...completed, taskId: 10, title: "Parent", hasChildren: true, children: [completed] }, completed];
  render(<MyTasksPage />);
  expect(screen.getAllByText("Board: Completed QA task")).toHaveLength(1);
  expect(screen.queryByText("Board: Parent")).not.toBeInTheDocument();
  expect(screen.getByText("Total:1")).toBeInTheDocument();
 });
 it("does not hide a matching child when its parent does not match the board search", () => {
  state.tasks = [{ ...completed, taskId: 10, title: "Parent", hasChildren: true, children: [completed] }];
  render(<MyTasksPage />);
  fireEvent.change(screen.getByRole("textbox", { name: "Search tasks" }), { target: { value: "Completed QA" } });
  expect(screen.getByText("Board: Completed QA task")).toBeInTheDocument();
 });
 it.each(restrictedPermissions)("offers no standalone create form or mutation without main-task permission: %j", permissions => {
  state.permissions = permissions;
  render(<MyTasksPage />);
  expect(screen.queryByRole("button", { name: "New Task" })).not.toBeInTheDocument();
  expect(state.createRendered).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Attempt status change" }));
  expect(state.update).not.toHaveBeenCalled();
 });
 it("allows a permitted creator to open the form", () => {
  state.permissions = { canCreateMainTasks: true };
  render(<MyTasksPage />);
  fireEvent.click(screen.getByRole("button", { name: "New Task" }));
  expect(screen.getByText("Create form")).toBeInTheDocument();
 });
});
