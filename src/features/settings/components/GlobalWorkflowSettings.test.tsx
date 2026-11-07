import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { GlobalWorkflowSettings } from "./GlobalWorkflowSettings";

vi.mock("@/lib/axios", () => ({ default: { get: vi.fn(), put: vi.fn() } }));
const stages = [
	{ slug: "backlog", name: "Backlog", category: "backlog", color: "#64748b", isTerminal: false },
	{ slug: "ready", name: "Ready", category: "planned", color: "#333333", isTerminal: false },
	{ slug: "working", name: "In Progress", category: "active", color: "#333333", isTerminal: false },
	{ slug: "hold", name: "On Hold", category: "paused", color: "#333333", isTerminal: false },
	{ slug: "review", name: "In Review", category: "review", color: "#333333", isTerminal: false },
	{ slug: "done", name: "Done", category: "done", color: "#333333", isTerminal: true },
];

it("requires a destination for removed stages and reviews before applying", async () => {
	const snapshot = { revision: "revision", stages, sources: [{ key: "old", name: "Backlog", slug: "backlog", category: "backlog", projects: 2, tasks: 3 }] };
	vi.mocked(api.get).mockResolvedValue({ data: { data: snapshot } });
	vi.mocked(api.put).mockResolvedValue({ data: { data: snapshot } });
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	render(<QueryClientProvider client={client}><GlobalWorkflowSettings /></QueryClientProvider>);
	fireEvent.click(await screen.findByRole("button", { name: "Use five-stage arrangement" }));
	expect(screen.getByRole("button", { name: "Review changes" })).toBeDisabled();
	fireEvent.change(screen.getByRole("combobox", { name: "Map Backlog backlog" }), { target: { value: "ready" } });
	fireEvent.click(screen.getByRole("button", { name: "Review changes" }));
	const dialog = screen.getByRole("dialog");
	expect(within(dialog).getByText(/3 tasks are mapped to a different category/)).toBeVisible();
	expect(api.put).not.toHaveBeenCalled();
	fireEvent.click(within(dialog).getByRole("button", { name: "Apply to all projects" }));
	await waitFor(() => expect(api.put).toHaveBeenCalledOnce());
	expect(vi.mocked(api.put).mock.calls[0][1]).toMatchObject({ revision: "revision", mapping: { old: "ready" }, stages: [{ slug: "ready", name: "To Do" }, { slug: "working" }, { slug: "review" }, { slug: "hold" }, { slug: "done" }] });
});
