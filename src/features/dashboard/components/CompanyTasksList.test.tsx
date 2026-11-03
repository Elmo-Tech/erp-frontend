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
	fireEvent.change(screen.getByRole("textbox", { name: "Search dashboard tasks" }), { target: { value: "Task 101" } });
	expect(screen.queryByRole("region", { name: "In Progress tasks" })).not.toBeInTheDocument();
	fireEvent.click(screen.getByRole("button", { name: /Task 101/ }));
	expect(screen.getByRole("dialog")).toHaveTextContent("Details for 101");
});
