import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { CompanyTasksList } from "./CompanyTasksList";

vi.mock("@/lib/axios", () => ({ default: { get: vi.fn() } }));
const auth = vi.hoisted(() => ({ userId: 11, pipeline: true }));
vi.mock("@/store/authStore", () => ({ useAuthStore: () => ({ user: { userId: auth.userId }, hasPermission: (permission: string) => permission === "view_tasks" }) }));
vi.mock("@/features/projects/components/tabs/TaskFormDialog", () => ({ TaskFormDialog: ({ task }: { task: { taskId: number } }) => <div>Legacy editor {task.taskId}</div> }));
vi.mock("@/features/projects/components/pipeline/PipelineTaskDialog", () => ({ PipelineTaskDialog: ({ task }: { task: { taskId: number } }) => <div>Pipeline editor {task.taskId}</div> }));
vi.mock("@/features/projects/hooks/useProjectPipeline", () => ({ useProjectPipeline: () => ({ data: { stages: [{ stageId: 4, tasks: [{ taskId: 7 }] }] } }) }));
vi.mock("@/features/projects/components/tasks/TaskDetailSheet", () => ({ TaskDetailSheet: ({ taskId, onEdit }: { taskId: number; onEdit: (task: unknown) => void }) => <div role="dialog">Details for {taskId}<button onClick={() => onEdit({ taskId, projectId: 2, type: "main", isPipelineTask: auth.pipeline })}>Edit task</button></div> }));

beforeEach(() => {
	const storage = new Map<string, string>();
	vi.mocked(localStorage.getItem).mockImplementation((key) => storage.get(key) ?? null);
	vi.mocked(localStorage.setItem).mockImplementation((key, value) => { storage.set(key, String(value)); });
	auth.userId = 11; auth.pipeline = true;
});

it("groups the complete list by actual status, searches it, and opens task details", async () => {
	const tasks = Array.from({ length: 101 }, (_, index) => ({ taskId: index + 1, title: `Task ${index + 1}`, project: "Campaign", status: index === 100 ? "Client Review" : "In Progress", statusColor: "#123456", priority: "medium", dueDate: null, assignees: ["Nour"] }));
	vi.mocked(api.get).mockResolvedValue({ data: { data: tasks } });
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	render(<QueryClientProvider client={client}><CompanyTasksList /></QueryClientProvider>);
	expect(await screen.findByText("101 tasks")).toBeVisible();
	expect(within(screen.getByRole("region", { name: "Client Review tasks" })).getByText("Task 101")).toBeVisible();
	const progress = screen.getByRole("region", { name: "In Progress tasks" });
	expect(within(progress).getByText("Task 1")).toBeVisible();
	for (const column of ["Task", "Project", "Assignee", "Due date", "Priority"]) expect(within(progress).getByRole("columnheader", { name: column })).toBeVisible();
	fireEvent.click(within(progress).getByRole("button", { name: /In Progress/ }));
	expect(within(progress).queryByText("Task 1")).not.toBeInTheDocument();
	fireEvent.click(within(progress).getByRole("button", { name: /In Progress/ }));
	fireEvent.change(screen.getByRole("textbox", { name: "Search dashboard tasks" }), { target: { value: "Task 101" } });
	expect(screen.queryByRole("region", { name: "In Progress tasks" })).not.toBeInTheDocument();
	fireEvent.click(screen.getByRole("button", { name: /Task 101/ }));
	expect(screen.getByRole("dialog")).toHaveTextContent("Details for 101");
});

it("shows the same grouped table on the tasks page", async () => {
	vi.mocked(api.get).mockResolvedValue({ data: { data: [{ taskId: 7, title: "Prepare artwork", project: "Launch", status: "Review", statusColor: "#123456", priority: "high", dueDate: "2026-11-10", assignees: ["Aya"] }] } });
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	render(<QueryClientProvider client={client}><CompanyTasksList variant="page" /></QueryClientProvider>);
	expect(await screen.findByRole("textbox", { name: "Search tasks" })).toBeVisible();
	const table = await screen.findByRole("table");
	for (const value of ["Prepare artwork", "Launch", "Aya", "2026-11-10", "high"]) expect(within(table).getByText(value)).toBeVisible();
	fireEvent.doubleClick(within(table).getByText("Launch"));
	expect(screen.getByRole("dialog")).toHaveTextContent("Details for 7");
});

it("remembers collapsed groups for the same user and keeps other users separate", async () => {
	vi.mocked(api.get).mockResolvedValue({ data: { data: [{ taskId: 7, title: "Prepare artwork", project: "Launch", status: "Review", statusColor: null, priority: null, dueDate: null, assignees: [] }] } });
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const view = render(<QueryClientProvider client={client}><CompanyTasksList variant="page" /></QueryClientProvider>);
	fireEvent.click(await screen.findByRole("button", { name: /Review/ }));
	await waitFor(() => expect(screen.queryByText("Prepare artwork")).not.toBeInTheDocument());
	view.unmount();
	const next = render(<QueryClientProvider client={client}><CompanyTasksList variant="page" /></QueryClientProvider>);
	expect(await screen.findByRole("button", { name: /Review/ })).toHaveAttribute("aria-expanded", "false");
	next.unmount();
	auth.userId = 12;
	render(<QueryClientProvider client={client}><CompanyTasksList variant="page" /></QueryClientProvider>);
	expect(await screen.findByRole("button", { name: /Review/ })).toHaveAttribute("aria-expanded", "true");
});

it("opens the project pipeline editor from the task details", async () => {
	vi.mocked(api.get).mockResolvedValue({ data: { data: [{ taskId: 7, title: "Prepare artwork", project: "Launch", status: "Review", statusColor: null, priority: null, dueDate: null, assignees: [] }] } });
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	render(<QueryClientProvider client={client}><CompanyTasksList variant="page" /></QueryClientProvider>);
	fireEvent.click(await screen.findByRole("button", { name: "Prepare artwork" }));
	fireEvent.click(screen.getByRole("button", { name: "Edit task" }));
	expect(screen.getByText("Pipeline editor 7")).toBeVisible();
});

it("opens the legacy task editor for a non-pipeline task", async () => {
	auth.pipeline = false;
	vi.mocked(api.get).mockResolvedValue({ data: { data: [{ taskId: 7, title: "Old task", project: "Launch", status: "Review", statusColor: null, priority: null, dueDate: null, assignees: [] }] } });
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	render(<QueryClientProvider client={client}><CompanyTasksList variant="page" /></QueryClientProvider>);
	fireEvent.click(await screen.findByRole("button", { name: "Old task" }));
	fireEvent.click(screen.getByRole("button", { name: "Edit task" }));
	expect(screen.getByText("Legacy editor 7")).toBeVisible();
});
