import { act, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import { ActiveTimersSheet } from "../ActiveTimersSheet";
import { timeEntriesApi } from "@/features/sales/api/timeEntries";

vi.mock("@/features/sales/hooks", async () => import("@/features/sales/hooks/useTimeEntries"));
vi.mock("@/features/sales/api/timeEntries", () => ({ timeEntriesApi: { getActiveTimers: vi.fn(async () => [{
	timeEntryId: 42, userId: 7, userName: "Working employee", trackableType: "App\\Models\\Task",
	trackableId: 12, trackableDisplayName: "Work task", startTime: "2026-10-26T10:00:00Z", elapsedMinutes: 2,
}]) } }));
vi.mock("@/store/authStore", () => ({ useAuthStore: (selector: (state: unknown) => unknown) => selector({
	user: { userId: 7 }, hasPermission: (name: string) => name === "view_all_time_entries",
}) }));

afterEach(() => { vi.useRealTimers(); });

it("advances visible session durations locally without periodic API requests", async () => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date("2026-10-26T10:02:00Z"));
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const { unmount } = render(<QueryClientProvider client={client}><ActiveTimersSheet><button>Monitor timers</button></ActiveTimersSheet></QueryClientProvider>);
	await act(async () => { await vi.advanceTimersByTimeAsync(0); });
	fireEvent.click(screen.getByRole("button", { name: "Monitor timers" }));
	await act(async () => { await vi.advanceTimersByTimeAsync(0); });
	expect(screen.getByText("2 minutes")).toBeInTheDocument();
	await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
	expect(screen.getByText("3 minutes")).toBeInTheDocument();
	expect(screen.getByText("Realtime updates • reconnect fallback")).toBeInTheDocument();
	expect(timeEntriesApi.getActiveTimers).toHaveBeenCalledTimes(1);
	unmount();
	client.clear();
});
