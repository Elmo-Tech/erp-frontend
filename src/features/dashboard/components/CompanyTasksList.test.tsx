import { fireEvent, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { CompanyTasksList } from "./CompanyTasksList";

vi.mock("@/lib/axios", () => ({ default: { get: vi.fn() } }));
vi.mock("@/store/authStore", () => ({ useAuthStore: () => ({ hasPermission: (permission: string) => permission === "view_tasks" }) }));
vi.mock("@/features/projects/components/tasks/TaskDetailSheet", () => ({ TaskDetailSheet: ({ taskId }: { taskId: number }) => <div role="dialog">Details for {taskId}</div> }));

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
