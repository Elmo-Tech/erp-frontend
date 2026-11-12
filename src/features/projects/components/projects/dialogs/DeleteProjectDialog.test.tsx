import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { useTimerStore } from "@/store/timerStore";

vi.mock("@/lib/axios", () => ({ default: { delete: vi.fn(), get: vi.fn() } }));
beforeEach(() => {
	vi.mocked(api.delete).mockReset();
	vi.mocked(api.get).mockImplementation(async (url) => ({ data: { data: url === "/time-entries/my-active" ? [] : null } }));
	useTimerStore.setState({ activeTimer: null, activeTimers: [], resumableTimer: null, isLoading: false });
	useAuthStore.setState({ role: "admin", permissions: [{ permissionName: "force_delete_projects", access: true }] });
});
afterEach(() => { cleanup(); useAuthStore.setState({ role: null, permissions: [] }); useTimerStore.setState({ activeTimer: null, activeTimers: [], resumableTimer: null, isLoading: true }); });

function renderDialog() {
	const onOpenChange = vi.fn();
	const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
	render(<QueryClientProvider client={client}><DeleteProjectDialog project={{ projectId: 7, title: "QA project" }} onOpenChange={onOpenChange} /></QueryClientProvider>);
	return onOpenChange;
}

it("omits soft-delete confirmation and refreshes a stale navbar timer after deletion", async () => {
	vi.mocked(api.delete).mockResolvedValue({ data: {} });
	useTimerStore.getState().setActiveTimer({ timeEntryId: 99, startTime: "2026-10-26T09:00:00", trackableType: "App\\Models\\Task", trackableId: 1, trackableProjectId: 7, trackableDisplayName: "Old task", isActive: true });
	const close = renderDialog();
	fireEvent.click(screen.getAllByRole("button", { name: "Move to trash" }).at(-1)!);
	await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/projects/7", { data: { permanent: false } }));
	await waitFor(() => expect(close).toHaveBeenCalledWith(false));
	expect(api.get).toHaveBeenCalledWith("/time-entries/my-active", { skipErrorToast: true });
	expect(useTimerStore.getState().activeTimer).toBeNull();
});

it("clears an old failure when changing deletion mode and requires exact permanent confirmation", async () => {
	vi.mocked(api.delete).mockRejectedValue({ response: { status: 409, data: { message: "Stop project timers first" } } });
	renderDialog();
	fireEvent.click(screen.getAllByRole("button", { name: "Move to trash" }).at(-1)!);
	await screen.findByText("Stop project timers first");
	fireEvent.click(screen.getByRole("button", { name: "Permanent deletion" }));
	expect(screen.queryByText("Stop project timers first")).not.toBeInTheDocument();
	const submit = screen.getByRole("button", { name: "Delete everything permanently" });
	expect(submit).toBeDisabled();
	fireEvent.change(screen.getByLabelText("Type the exact project name to confirm"), { target: { value: "QA project" } });
	expect(submit).toBeEnabled();
});
