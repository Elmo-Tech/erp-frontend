import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { useRealtimeTimer, useTimerSocketInit } from "../useTimerSocket";
import { type TimeEntryData, useTimerStore } from "@/store/timerStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

let client: QueryClient;
function wrapper({ children }: { children: ReactNode }) { return <QueryClientProvider client={client}>{children}</QueryClientProvider>; }
function renderTimerHook<T>(callback: () => T) { return renderHook(callback, { wrapper }); }

vi.mock("@/lib/axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock("@/lib/echo", () => ({ getEcho: () => null }));
vi.mock("@/store/authStore", () => {
	const state = { user: { userId: 7 } };
	return { useAuthStore: Object.assign(() => state, { getState: () => state }) };
});

const timer: TimeEntryData = {
	timeEntryId: 42, sessionId: "timer-session", isActive: true,
	startTime: "2026-10-11T10:00:00", trackableType: "App\\Models\\Task",
	trackableId: 12, trackableDisplayName: "Running task",
};

describe("timer synchronization", () => {
	beforeEach(() => {
		client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
		vi.useFakeTimers();
		vi.mocked(api.get).mockReset();
		vi.mocked(api.post).mockReset();
		useTimerStore.setState({ activeTimer: null, resumableTimer: null, isLoading: true, isConnected: false });
	});

	afterEach(() => { client.clear(); vi.useRealTimers(); });

	it("Keep a running timer open through two heartbeat intervals", async () => {
		vi.mocked(api.get).mockResolvedValue({ data: { data: timer } });
		vi.mocked(api.post).mockImplementation(async () => ({ data: { data: { ...timer, lastHeartbeatAt: new Date().toISOString() } } }));
		renderTimerHook(() => useTimerSocketInit());
		await act(async () => {});
		for (let interval = 0; interval < 2; interval++) {
			await act(async () => { await vi.advanceTimersByTimeAsync(45_000); });
			expect(useTimerStore.getState().activeTimer).toMatchObject({ timeEntryId: 42, isActive: true });
			expect(useTimerStore.getState().resumableTimer).toBeNull();
		}
		expect(api.post).toHaveBeenCalledTimes(3);
		expect(api.post).toHaveBeenLastCalledWith("/time-entries/heartbeat", { timeEntryId: 42, sessionId: "timer-session" }, { skipErrorToast: true, skipSuccessToast: true });
	});

	it("does not overwrite a newly started timer with an older paused snapshot", async () => {
		let resolveActive!: (value: unknown) => void;
		vi.mocked(api.get).mockImplementationOnce(() => new Promise((resolve) => { resolveActive = resolve; }));
		vi.mocked(api.get).mockResolvedValueOnce({ data: { data: { ...timer, isActive: false, stopReason: "pause" } } });
		const { result } = renderTimerHook(() => useRealtimeTimer());
		let refresh!: Promise<void>;
		act(() => { refresh = result.current.refetch(); });
		act(() => { useTimerStore.getState().setActiveTimer(timer); });
		await act(async () => {
			resolveActive({ data: { data: null } });
			await refresh;
		});
		expect(result.current.activeTimer).toEqual(timer);
		expect(result.current.resumableTimer).toBeNull();
	});

	it("preserves a running timer when state refresh fails", async () => {
		useTimerStore.setState({ activeTimer: timer, isLoading: false });
		vi.mocked(api.get).mockRejectedValueOnce(new Error("Network Error"));
		const { result } = renderTimerHook(() => useRealtimeTimer());
		await act(async () => { await result.current.refetch(); });
		expect(result.current.activeTimer).toEqual(timer);
	});

	it("does not restore a paused timer from a late heartbeat response", async () => {
		vi.mocked(api.get).mockResolvedValue({ data: { data: timer } });
		let resolveHeartbeat!: (value: unknown) => void;
		vi.mocked(api.post).mockImplementationOnce(() => new Promise((resolve) => { resolveHeartbeat = resolve; }));
		renderTimerHook(() => useTimerSocketInit());
		await act(async () => {});
		const paused = { ...timer, isActive: false, stopReason: "pause" as const };
		act(() => { useTimerStore.setState({ activeTimer: null, resumableTimer: paused }); });
		await act(async () => { resolveHeartbeat({ data: { data: timer } }); });
		expect(useTimerStore.getState().activeTimer).toBeNull();
		expect(useTimerStore.getState().resumableTimer).toEqual(paused);
	});

	it("refreshes dashboard and monitoring data on lifecycle changes but not each heartbeat", async () => {
		vi.mocked(api.get).mockResolvedValue({ data: { data: null } });
		vi.mocked(api.post).mockResolvedValue({ data: { data: timer } });
		renderTimerHook(() => useTimerSocketInit());
		await act(async () => {});
		const key = ["dashboard-stats", 7];
		client.setQueryData(key, { running: 0 });
		await act(async () => { useTimerStore.getState().setActiveTimer(timer); });
		expect(client.getQueryState(key)?.isInvalidated).toBe(true);
		client.setQueryData(key, { running: 1 });
		await act(async () => { useTimerStore.getState().setActiveTimer({ ...timer, lastHeartbeatAt: "2026-10-11T10:00:45" }); });
		expect(client.getQueryState(key)?.isInvalidated).toBe(false);
		await act(async () => { useTimerStore.getState().setActiveTimer(null); });
		expect(client.getQueryState(key)?.isInvalidated).toBe(true);
	});

	it("synchronizes starts and stops from another session when realtime is unavailable", async () => {
		let running = false;
		vi.mocked(api.get).mockImplementation(async (url) => ({ data: { data: url === "/time-entries/active" && running ? timer : null } }));
		vi.mocked(api.post).mockResolvedValue({ data: { data: timer } });
		renderTimerHook(() => useTimerSocketInit());
		await act(async () => {});
		running = true;
		await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
		expect(useTimerStore.getState().activeTimer?.timeEntryId).toBe(timer.timeEntryId);
		running = false;
		await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
		expect(useTimerStore.getState().activeTimer).toBeNull();
	});
});
