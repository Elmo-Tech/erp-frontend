import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import api from "@/lib/axios";
import type { Task } from "@/features/dashboard/types/task";
import { DescriptionChecklist } from "./DescriptionChecklist";
import { DescriptionChecklistEditor } from "./DescriptionChecklistEditor";

vi.mock("@/lib/axios", () => ({ default: { patch: vi.fn() } }));

it("marks a checklist item complete through the task API", async () => {
	vi.mocked(api.patch).mockResolvedValue({ data: {} });
	const task = { taskId: 8, projectId: 2, checklist: [{ id: "item-1", text: "Prepare artwork", completed: false }] } as Task;
	const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
	render(<QueryClientProvider client={client}><DescriptionChecklist task={task} canEdit /></QueryClientProvider>);
	fireEvent.click(screen.getByRole("checkbox", { name: "Prepare artwork" }));
	await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/tasks/8/checklist/item-1", { completed: true }));
});

it("updates the checklist text and completion state", () => {
	const update = vi.fn();
	render(<DescriptionChecklistEditor items={[{ id: "one", text: "Draft", completed: false }]} onChange={update} />);
	fireEvent.change(screen.getByRole("textbox", { name: "Checklist item 1" }), { target: { value: "Review" } });
	expect(update).toHaveBeenCalledWith([{ id: "one", text: "Review", completed: false }]);
	fireEvent.click(screen.getByRole("checkbox", { name: "Complete checklist item 1" }));
	expect(update).toHaveBeenCalledWith([{ id: "one", text: "Draft", completed: true }]);
});
