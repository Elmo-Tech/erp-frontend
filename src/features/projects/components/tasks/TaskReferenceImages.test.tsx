import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import api from "@/lib/axios";
import type { Task } from "@/features/dashboard/types/task";
import { TaskReferenceImages } from "./TaskReferenceImages";

vi.mock("@/lib/axios", () => ({ default: { post: vi.fn(), delete: vi.fn() } }));

it("lets a viewer open the cover and references and limits upload controls to managers", () => {
	const task = { taskId: 1, projectId: 2, isPipelineTask: true, coverImageUrl: "/cover.jpg", referenceImages: [{ id: "one.jpg", url: "/one.jpg" }] } as Task;
	const client = new QueryClient();
	const view = render(<QueryClientProvider client={client}><TaskReferenceImages task={task} canManage={false} /></QueryClientProvider>);
	expect(screen.getByRole("link", { name: "Open cover image" })).toHaveAttribute("href", "/cover.jpg");
	expect(screen.getByRole("link", { name: "Reference 1" })).toHaveAttribute("href", "/one.jpg");
	expect(screen.queryByLabelText("Add reference images")).not.toBeInTheDocument();
	view.rerender(<QueryClientProvider client={client}><TaskReferenceImages task={task} canManage /></QueryClientProvider>);
	expect(screen.getByLabelText("Add reference images")).toBeInTheDocument();
});

it("uploads multiple selected images individually", async () => {
	vi.mocked(api.post).mockResolvedValue({});
	const task = { taskId: 1, projectId: 2, isPipelineTask: true } as Task;
	const client = new QueryClient();
	render(<QueryClientProvider client={client}><TaskReferenceImages task={task} canManage /></QueryClientProvider>);
	fireEvent.change(screen.getByLabelText("Add reference images"), { target: { files: [new File(["a"], "one.jpg", { type: "image/jpeg" }), new File(["b"], "two.png", { type: "image/png" })] } });
	await waitFor(() => expect(api.post).toHaveBeenCalledTimes(2));
	expect(api.post).toHaveBeenCalledWith("/projects/2/pipeline/tasks/1/references", expect.any(FormData), expect.any(Object));
});
