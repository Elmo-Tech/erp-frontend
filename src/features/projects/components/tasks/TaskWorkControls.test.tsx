import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { timeEntriesApi } from "@/features/sales/api/timeEntries";
import { TrackableType, type TimeEntry } from "@/features/sales/types/timeEntry";
import { useTimerStore } from "@/store/timerStore";
import { TaskWorkControls } from "./TaskWorkControls";

vi.mock("@/features/sales/api/timeEntries", () => ({ timeEntriesApi: { start: vi.fn(), resume: vi.fn(), pause: vi.fn(), hold: vi.fn(), end: vi.fn() } }));

const entry: TimeEntry = {
	timeEntryId: 41, userId: 7, sessionId: "work-session", trackableId: 12, trackableType: TrackableType.TASK,
	trackableDisplayName: "Delivery task", startTime: new Date(Date.now() - 60000).toISOString(),
	createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
};

function renderControls(canWork = true) {
	const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
	return render(<QueryClientProvider client={client}><TaskWorkControls taskId={12} title="Delivery task" canWork={canWork} /></QueryClientProvider>);
}

describe("TaskWorkControls", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useTimerStore.setState({ activeTimer: null, resumableTimer: null, isLoading: false });
	});

	it("starts, pauses, and resumes through the shared work timer store", async () => {
		vi.mocked(timeEntriesApi.start).mockResolvedValue(entry);
		vi.mocked(timeEntriesApi.pause).mockResolvedValue({ ...entry, stopReason: "pause" });
		vi.mocked(timeEntriesApi.resume).mockResolvedValue({ ...entry, timeEntryId: 42 });
		renderControls();
		fireEvent.click(screen.getByRole("button", { name: "Start work on Delivery task" }));
		await waitFor(() => expect(screen.getByRole("button", { name: "Pause work on Delivery task" })).toBeEnabled());
		expect(timeEntriesApi.start).toHaveBeenCalledWith({ trackableType: "task", trackableId: 12 }, expect.anything());
		fireEvent.click(screen.getByRole("button", { name: "Pause work on Delivery task" }));
		await waitFor(() => expect(screen.getByRole("button", { name: "Resume work on Delivery task" })).toBeEnabled());
		expect(useTimerStore.getState().activeTimer).toBeNull();
		expect(useTimerStore.getState().resumableTimer?.stopReason).toBe("pause");
		fireEvent.click(screen.getByRole("button", { name: "Resume work on Delivery task" }));
		await waitFor(() => expect(useTimerStore.getState().activeTimer?.timeEntryId).toBe(42));
		expect(timeEntriesApi.resume).toHaveBeenCalledWith(41, expect.anything());
		expect(useTimerStore.getState().resumableTimer).toBeNull();
	});

	it("starts a different task while an earlier timer is paused", async () => {
		useTimerStore.setState({ activeTimer: null, resumableTimer: { ...entry, trackableId: 99, isActive: false, stopReason: "pause" } });
		vi.mocked(timeEntriesApi.start).mockResolvedValue(entry);
		renderControls();
		fireEvent.click(screen.getByRole("button", { name: "Start work on Delivery task" }));
		await waitFor(() => expect(timeEntriesApi.start).toHaveBeenCalledWith({ trackableType: "task", trackableId: 12 }, expect.anything()));
		expect(useTimerStore.getState().activeTimer?.trackableId).toBe(12);
	});

	it("requires a hold reason and retains the resumable session", async () => {
		useTimerStore.setState({ activeTimer: { ...entry, isActive: true } });
		vi.mocked(timeEntriesApi.hold).mockResolvedValue({ ...entry, stopReason: "hold" });
		renderControls();
		fireEvent.click(screen.getByRole("button", { name: "Hold work on Delivery task" }));
		expect(screen.getByRole("button", { name: "Put on hold" })).toBeDisabled();
		fireEvent.change(screen.getByLabelText("Hold reason"), { target: { value: "  Waiting for assets  " } });
		fireEvent.click(screen.getByRole("button", { name: "Put on hold" }));
		await waitFor(() => expect(useTimerStore.getState().resumableTimer?.stopReason).toBe("hold"));
		expect(timeEntriesApi.hold).toHaveBeenCalledWith("Waiting for assets");
		expect(useTimerStore.getState().activeTimer).toBeNull();
	});

	it("ends work without leaving a resumable timer", async () => {
		useTimerStore.setState({ activeTimer: { ...entry, isActive: true } });
		vi.mocked(timeEntriesApi.end).mockResolvedValue({ ...entry, stopReason: "end" });
		renderControls();
		fireEvent.click(screen.getByRole("button", { name: "End work on Delivery task" }));
		await waitFor(() => expect(timeEntriesApi.end).toHaveBeenCalled());
		await waitFor(() => expect(useTimerStore.getState().activeTimer).toBeNull());
		expect(useTimerStore.getState().resumableTimer).toBeNull();
	});

	it("Complete a running task from the board", async () => {
		useTimerStore.setState({ activeTimer: { ...entry, isActive: true } });
		let status = "In Progress";
		vi.mocked(timeEntriesApi.end).mockImplementation(async () => { status = "Completed"; return { ...entry, stopReason: "end" }; });
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		function BoardTask() {
			const task = useQuery({ queryKey: ["project-pipeline", 1], queryFn: async () => ({ status }) });
			return <><span>{task.data?.status}</span><TaskWorkControls taskId={12} title="Delivery task" canWork /></>;
		}
		render(<QueryClientProvider client={queryClient}><BoardTask /></QueryClientProvider>);
		await screen.findByText("In Progress");
		fireEvent.click(screen.getByRole("button", { name: "End work on Delivery task" }));
		await screen.findByText("Completed");
		expect(screen.queryByText("In Progress")).not.toBeInTheDocument();
		expect(useTimerStore.getState().activeTimer).toBeNull();
	});

	it("does not mutate the timer on a failed pause", async () => {
		useTimerStore.setState({ activeTimer: { ...entry, isActive: true } });
		vi.mocked(timeEntriesApi.pause).mockRejectedValue(new Error("Request failed"));
		renderControls();
		fireEvent.click(screen.getByRole("button", { name: "Pause work on Delivery task" }));
		await waitFor(() => expect(timeEntriesApi.pause).toHaveBeenCalled());
		await waitFor(() => expect(screen.getByRole("button", { name: "Pause work on Delivery task" })).toBeEnabled());
		expect(useTimerStore.getState().activeTimer?.timeEntryId).toBe(41);
	});

	it("disables work for unassigned viewers and does not confuse another trackable with this task", () => {
		useTimerStore.setState({ activeTimer: { ...entry, trackableType: "lead", isActive: true } });
		renderControls(false);
		expect(screen.getByRole("button", { name: "Start work on Delivery task" })).toBeDisabled();
		expect(screen.queryByRole("button", { name: "End work on Delivery task" })).not.toBeInTheDocument();
		expect(screen.getByText("Pause or end your current timer first.")).toBeInTheDocument();
	});
});
