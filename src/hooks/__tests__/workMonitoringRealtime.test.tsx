import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getEcho } from "@/lib/echo";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { useTimerStore, type TimeEntryData } from "@/store/timerStore";
import { dashboardStatsApi } from "@/features/dashboard/api";
import { timeEntriesApi } from "@/features/sales/api/timeEntries";
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats";
import { useActiveTimers } from "@/features/sales/hooks/useTimeEntries";
import { useWorkMonitoringSocketInit } from "../useWorkMonitoringSocket";
import { useTimerSocketInit } from "../useTimerSocket";

vi.mock("@/lib/echo", () => ({ getEcho: vi.fn() }));
vi.mock("@/lib/axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock("@/features/dashboard/api", () => ({ dashboardStatsApi: { getOverview: vi.fn(async () => ({ stats: {} })) } }));
vi.mock("@/features/sales/api/timeEntries", () => ({ timeEntriesApi: { getActiveTimers: vi.fn(async () => []) } }));

function createEcho() {
	type Callback = () => void;
	function createChannel() {
		let onSubscribed: Callback = () => {};
		let onError: Callback = () => {};
		const listeners = new Map<string, Callback>();
		const channel = {
			subscription: { subscribed: false, unbind: vi.fn() },
			listen: vi.fn((event: string, callback: Callback) => { listeners.set(event, callback); return channel; }),
			stopListening: vi.fn((event: string) => { listeners.delete(event); return channel; }),
			subscribed: vi.fn((callback: Callback) => { onSubscribed = callback; return channel; }),
			error: vi.fn((callback: Callback) => { onError = callback; return channel; }),
			acknowledge: () => { channel.subscription.subscribed = true; onSubscribed(); },
			fail: () => { channel.subscription.subscribed = false; onError(); },
			emit: (event: string) => { listeners.get(event)?.(); },
		};
		return channel;
	}
	const channels = new Map<string, ReturnType<typeof createChannel>>();
	const stateListeners = new Set<(state: { current: string }) => void>();
	const echo = {
		connector: { pusher: { connection: {
			bind: vi.fn((_event: string, callback: (state: { current: string }) => void) => { stateListeners.add(callback); }),
			unbind: vi.fn((_event: string, callback: (state: { current: string }) => void) => { stateListeners.delete(callback); }),
		} } },
		private: vi.fn((name: string) => {
			if (!channels.has(name)) channels.set(name, createChannel());
			return channels.get(name)!;
		}),
		leave: vi.fn(),
		channel: (name = "work-monitoring") => channels.get(name)!,
		state: (current: string) => { stateListeners.forEach((callback) => callback({ current })); },
	};
	vi.mocked(getEcho).mockReturnValue(echo as unknown as ReturnType<typeof getEcho>);
	return echo;
}

let client: QueryClient;
function wrapper({ children }: { children: ReactNode }) { return <QueryClientProvider client={client}>{children}</QueryClientProvider>; }
function useMonitoringViews() {
	useWorkMonitoringSocketInit();
	useDashboardStats();
	useActiveTimers();
}
const advance = async (time: number) => { await act(async () => { await vi.advanceTimersByTimeAsync(time); }); };

describe("realtime work monitoring", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.clearAllMocks();
		client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
		useAuthStore.setState({
			user: { userId: 7, name: "Monitor", email: "monitor@example.test", avatar: "", role: "admin" },
			role: "admin", permissions: [{ permissionName: "view_all_time_entries", access: true }, { permissionName: "view_dashboard", access: true }],
		});
		useTimerStore.setState({ activeTimer: null, resumableTimer: null, isLoading: true, isConnected: false });
		vi.mocked(api.get).mockResolvedValue({ data: { data: null } });
		Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
		Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
	});
	afterEach(() => { client.clear(); vi.useRealTimers(); });

	it("fetches on changes, coalesces a burst, and makes no periodic monitoring requests while subscribed", async () => {
		const echo = createEcho();
		renderHook(useMonitoringViews, { wrapper });
		await advance(0);
		await act(async () => { echo.channel().acknowledge(); });
		const calls = vi.mocked(dashboardStatsApi.getOverview).mock.calls.length;
		const timerCalls = vi.mocked(timeEntriesApi.getActiveTimers).mock.calls.length;
		await advance(180_000);
		expect(dashboardStatsApi.getOverview).toHaveBeenCalledTimes(calls);
		expect(timeEntriesApi.getActiveTimers).toHaveBeenCalledTimes(timerCalls);
		act(() => { echo.channel().emit(".work.activity.changed"); echo.channel().emit(".work.activity.changed"); });
		await advance(149);
		expect(dashboardStatsApi.getOverview).toHaveBeenCalledTimes(calls);
		await advance(1);
		expect(dashboardStatsApi.getOverview).toHaveBeenCalledTimes(calls + 1);
		expect(timeEntriesApi.getActiveTimers).toHaveBeenCalledTimes(timerCalls + 1);
	});

	it("resynchronizes after reconnect and stops fallback only after the private subscription is acknowledged", async () => {
		const echo = createEcho();
		renderHook(useMonitoringViews, { wrapper });
		await advance(0);
		await act(async () => { echo.channel().acknowledge(); });
		const calls = vi.mocked(dashboardStatsApi.getOverview).mock.calls.length;
		act(() => { echo.state("unavailable"); });
		await advance(60_000);
		expect(dashboardStatsApi.getOverview).toHaveBeenCalledTimes(calls + 1);
		act(() => { echo.state("connected"); });
		await advance(60_000);
		expect(dashboardStatsApi.getOverview).toHaveBeenCalledTimes(calls + 2);
		await act(async () => { echo.channel().acknowledge(); });
		expect(dashboardStatsApi.getOverview).toHaveBeenCalledTimes(calls + 3);
		await advance(120_000);
		expect(dashboardStatsApi.getOverview).toHaveBeenCalledTimes(calls + 3);
	});

	it("keeps fallback when channel authorization fails despite a connected socket", async () => {
		const echo = createEcho();
		renderHook(useMonitoringViews, { wrapper });
		await advance(0);
		act(() => { echo.state("connected"); echo.channel().fail(); });
		await advance(60_000);
		expect(dashboardStatsApi.getOverview).toHaveBeenCalledTimes(2);
		expect(timeEntriesApi.getActiveTimers).toHaveBeenCalledTimes(2);
	});

	it("recovers missed hidden/offline changes on visibility or network return", async () => {
		const echo = createEcho();
		renderHook(useMonitoringViews, { wrapper });
		await advance(0);
		await act(async () => { echo.channel().acknowledge(); });
		const calls = vi.mocked(dashboardStatsApi.getOverview).mock.calls.length;
		Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
		act(() => { echo.channel().emit(".work.activity.changed"); echo.state("disconnected"); });
		await advance(120_000);
		expect(dashboardStatsApi.getOverview).toHaveBeenCalledTimes(calls);
		Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
		await act(async () => { document.dispatchEvent(new Event("visibilitychange")); });
		expect(dashboardStatsApi.getOverview).toHaveBeenCalledTimes(calls + 1);
		Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
		await advance(60_000);
		expect(dashboardStatsApi.getOverview).toHaveBeenCalledTimes(calls + 1);
		Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
		await act(async () => { window.dispatchEvent(new Event("online")); });
		expect(dashboardStatsApi.getOverview).toHaveBeenCalledTimes(calls + 2);
	});

	it("uses the visible/online fallback if Reverb is not configured", async () => {
		vi.mocked(getEcho).mockReturnValue(null);
		renderHook(useMonitoringViews, { wrapper });
		await advance(60_000);
		expect(dashboardStatsApi.getOverview).toHaveBeenCalledTimes(2);
		expect(timeEntriesApi.getActiveTimers).toHaveBeenCalledTimes(2);
	});

	it("does not subscribe without monitoring access and cleans up queued events on permission loss", async () => {
		const echo = createEcho();
		const { unmount } = renderHook(useMonitoringViews, { wrapper });
		await advance(0);
		act(() => { echo.channel().emit(".work.activity.changed"); });
		await act(async () => { useAuthStore.setState({ role: "developer", permissions: [{ permissionName: "view_dashboard", access: true }] }); });
		expect(echo.leave).toHaveBeenCalledWith("work-monitoring");
		const calls = vi.mocked(dashboardStatsApi.getOverview).mock.calls.length;
		await advance(60_000);
		expect(dashboardStatsApi.getOverview).toHaveBeenCalledTimes(calls);
		unmount();
		echo.private.mockClear();
		renderHook(() => useWorkMonitoringSocketInit(), { wrapper });
		expect(echo.private).not.toHaveBeenCalled();
	});

	it("updates the private timer on events without polling GETs while connected, preserving heartbeats", async () => {
		const echo = createEcho();
		const timer: TimeEntryData = {
			timeEntryId: 42, sessionId: "session", isActive: true, startTime: "2026-10-26T10:00:00Z",
			trackableId: 12, trackableType: "App\\Models\\Task", trackableDisplayName: "Running task",
		};
		renderHook(() => useTimerSocketInit(), { wrapper });
		await advance(0);
		await act(async () => { echo.channel("user.7").acknowledge(); });
		expect(useTimerStore.getState().isConnected).toBe(true);
		vi.mocked(api.get).mockResolvedValue({ data: { data: timer } });
		vi.mocked(api.post).mockResolvedValue({ data: { data: timer } });
		await act(async () => { echo.channel("user.7").emit(".timer.updated"); });
		expect(useTimerStore.getState().activeTimer?.timeEntryId).toBe(42);
		const calls = vi.mocked(api.get).mock.calls.length;
		await advance(120_000);
		expect(api.get).toHaveBeenCalledTimes(calls);
		expect(api.post).toHaveBeenCalledTimes(3);
		act(() => { echo.state("unavailable"); });
		expect(useTimerStore.getState().isConnected).toBe(false);
		vi.mocked(api.get).mockResolvedValue({ data: { data: null } });
		await advance(60_000);
		expect(useTimerStore.getState().activeTimer).toBeNull();
	});
});
