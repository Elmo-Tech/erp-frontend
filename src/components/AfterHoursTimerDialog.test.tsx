import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { useTimerStore } from "@/store/timerStore";
import api from "@/lib/axios";
import { AfterHoursTimerDialog } from "./AfterHoursTimerDialog";

vi.mock("@/lib/axios", () => ({ default: { post: vi.fn() } }));
vi.mock("@/hooks/useTimerSocket", () => ({ useRealtimeTimer: () => ({ refetch: vi.fn() }) }));

beforeEach(() => {
	vi.clearAllMocks();
	useTimerStore.setState({ activeTimers: [], activeTimer: null, resumableTimer: null });
	useTimerStore.getState().setActiveTimer({ timeEntryId: 5, startTime: "2026-11-05T10:00:00", trackableType: "Task", trackableId: 7, trackableDisplayName: "Design", isActive: true, afterHoursPromptAt: "2026-11-05T18:00:00+02:00", afterHoursGraceMinutes: 10 });
});

it("confirms the current reminder and clears it after the server accepts", async () => {
	vi.mocked(api.post).mockResolvedValue({ data: { data: { ...useTimerStore.getState().activeTimer, afterHoursPromptAt: null } } });
	render(<AfterHoursTimerDialog />);
	expect(screen.getByText(/within 10 minutes/)).toBeVisible();
	fireEvent.click(screen.getByRole("button", { name: "Still working" }));
	await waitFor(() => expect(useTimerStore.getState().activeTimer?.afterHoursPromptAt).toBeNull());
	expect(api.post).toHaveBeenCalledWith("/time-entries/confirm-after-hours", { timeEntryId: 5, promptAt: "2026-11-05T18:00:00+02:00", stop: false });
});

it("pauses the current timer when requested", async () => {
	vi.mocked(api.post).mockResolvedValue({ data: { data: { ...useTimerStore.getState().activeTimer, isActive: false } } });
	render(<AfterHoursTimerDialog />);
	fireEvent.click(screen.getByRole("button", { name: "Pause timer" }));
	await waitFor(() => expect(useTimerStore.getState().activeTimer).toBeNull());
	expect(useTimerStore.getState().resumableTimer?.timeEntryId).toBe(5);
});
