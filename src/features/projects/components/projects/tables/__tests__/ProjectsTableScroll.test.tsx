import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import { projectsApi } from "@/features/projects/api/projects";
import { ProjectsTable } from "../ProjectsTable";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/features/projects/api/projects", () => ({ projectsApi: { getAll: vi.fn() } }));
vi.mock("@/features/projects/hooks/useProjects", () => ({ projectKeys: { lists: () => ["projects", "list"] }, usePinProject: () => ({ mutateAsync: vi.fn() }), useUnpinProject: () => ({ mutateAsync: vi.fn() }) }));
vi.mock("@/features/admin/hooks/usePermissions", () => ({ usePermissions: () => ({ canDeleteProjects: false, canEditProjects: false }) }));
vi.mock("@/store/authStore", () => ({ useAuthStore: (selector: (state: unknown) => unknown) => selector({ hasPermission: () => false }) }));
vi.mock("@/features/settings/hooks/useLookupOptions", () => ({ useLookupOptions: () => ({ data: { data: [] }, isLoading: false }) }));

let observerCallback: IntersectionObserverCallback;
class FakeObserver {
	constructor(callback: IntersectionObserverCallback) { observerCallback = callback; }
	observe() {}
	disconnect() {}
}
afterEach(() => vi.unstubAllGlobals());

it("loads the next page on scroll and resets the list when searching", async () => {
	vi.stubGlobal("IntersectionObserver", FakeObserver);
	vi.mocked(projectsApi.getAll).mockImplementation(async (filters) => {
		const page = filters?.page ?? 1;
		const title = filters?.search ? "Search result" : page === 1 ? "First project" : "Second project";
		return { projects: [{ projectId: filters?.search ? 3 : page, title, status: "active", isPinned: false, taskSummary: { total: 3, statuses: [{ name: "To Do", color: "#334455", count: 1 }, { name: "Done", color: "#115533", count: 2 }] } }], pagination: { total: filters?.search ? 1 : 2, count: 1, perPage: 1, currentPage: page, totalPages: filters?.search ? 1 : 2 } } as never;
	});
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	render(<QueryClientProvider client={client}><ProjectsTable /></QueryClientProvider>);
	expect(await screen.findByText("First project")).toBeVisible();
	expect(screen.getByText("3 tasks")).toBeVisible();
	expect(screen.getByText("To Do: 1")).toBeVisible();
	expect(screen.queryByRole("columnheader", { name: "Deadline" })).not.toBeInTheDocument();
	expect(screen.queryByRole("columnheader", { name: "Type" })).not.toBeInTheDocument();
	expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
	act(() => observerCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
	expect(await screen.findByText("Second project")).toBeVisible();
	expect(screen.getByText("First project")).toBeVisible();
	fireEvent.change(screen.getByRole("textbox", { name: "Search projects..." }), { target: { value: "specific" } });
	expect(await screen.findByText("Search result")).toBeVisible();
	expect(screen.queryByText("First project")).not.toBeInTheDocument();
	await waitFor(() => expect(projectsApi.getAll).toHaveBeenCalledWith(expect.objectContaining({ search: "specific", page: 1 })));
});
