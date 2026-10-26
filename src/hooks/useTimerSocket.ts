"use client";

import { useEffect, useRef } from "react";
import { getEcho } from "@/lib/echo";
import { useAuthStore } from "@/store/authStore";
import { TimeEntryData, useTimerStore } from "@/store/timerStore";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";

interface TimerUpdateEvent {
	action: string;
	timeEntry: TimeEntryData | null;
}

async function synchronizeTimer() {
	const snapshot = useTimerStore.getState();
	try {
		const activeResponse = await api.get<{ data: TimeEntryData | null }>("/time-entries/active", { skipErrorToast: true });
		const activeTimer = activeResponse.data.data;
		const resumableTimer = activeTimer?.isActive
			? null
			: (await api.get<{ data: TimeEntryData | null }>("/time-entries/resumable", { skipErrorToast: true })).data.data;
		const current = useTimerStore.getState();
		// A start/resume/stop or heartbeat may have completed during this fetch.
		// An older snapshot must not overwrite that newer state.
		if (current.activeTimer !== snapshot.activeTimer || current.resumableTimer !== snapshot.resumableTimer) return;
		useTimerStore.setState({ activeTimer: activeTimer?.isActive ? activeTimer : null, resumableTimer });
	} catch {
		// A network failure is not confirmation that the timer was paused.
	} finally {
		snapshot.setIsLoading(false);
	}
}

// Hook to initialize WebSocket connection (call once in layout/provider)
export function useTimerSocketInit() {
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const { activeTimer, resumableTimer, isLoading, setActiveTimer, setResumableTimer, setIsConnected } = useTimerStore();
	const channelRef = useRef<unknown>(null);
	const lastTimerState = useRef<string | null>(null);
	const activeId = activeTimer?.timeEntryId;
	const resumableId = resumableTimer?.timeEntryId;
	useEffect(() => {
		if (isLoading) return;
		const signature = `${activeId ?? "none"}:${resumableId ?? "none"}`;
		if (lastTimerState.current !== null && lastTimerState.current !== signature) {
			void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
			void queryClient.invalidateQueries({ queryKey: ["timeEntries", "activeTimers"] });
		}
		lastTimerState.current = signature;
	}, [activeId, resumableId, isLoading, queryClient]);

	// Initial fetch
	const fetchActiveTimer = synchronizeTimer;

	useEffect(() => {
		if (!activeTimer?.sessionId) {
			return;
		}
		let disposed = false;

		const sendHeartbeat = async () => {
			if (!navigator.onLine) {
				return;
			}

			try {
				const response = await api.post<{ data: TimeEntryData }>(
					"/time-entries/heartbeat",
					{
						timeEntryId: activeTimer.timeEntryId,
						sessionId: activeTimer.sessionId,
					},
					{ skipErrorToast: true, skipSuccessToast: true }
				);
				const current = useTimerStore.getState().activeTimer;
				if (!disposed && current?.timeEntryId === activeTimer.timeEntryId && current.sessionId === activeTimer.sessionId && response.data.data.isActive) {
					useTimerStore.setState({ activeTimer: response.data.data, resumableTimer: null });
				}
			} catch (error: unknown) {
				const status = (error as { response?: { status?: number } }).response?.status;
				if (!disposed && status === 409) {
					await fetchActiveTimer();
				}
			}
		};

		const handleVisibilityOrOnline = () => {
			if (document.visibilityState === "visible" && navigator.onLine) {
				void sendHeartbeat();
			}
		};

		void sendHeartbeat();
		const interval = window.setInterval(sendHeartbeat, 45_000);
		document.addEventListener("visibilitychange", handleVisibilityOrOnline);
		window.addEventListener("online", handleVisibilityOrOnline);

		return () => {
			disposed = true;
			window.clearInterval(interval);
			document.removeEventListener("visibilitychange", handleVisibilityOrOnline);
			window.removeEventListener("online", handleVisibilityOrOnline);
		};
	}, [activeTimer?.sessionId, activeTimer?.timeEntryId, fetchActiveTimer]);

	// Subscribe to WebSocket
	useEffect(() => {
		if (!user?.userId) return;
		void fetchActiveTimer();
		const refreshIfVisible = () => { if (document.visibilityState === "visible" && navigator.onLine) void fetchActiveTimer(); };
		const interval = window.setInterval(refreshIfVisible, 30_000);
		document.addEventListener("visibilitychange", refreshIfVisible);
		window.addEventListener("online", refreshIfVisible);
		const cleanUpRefresh = () => {
			window.clearInterval(interval);
			document.removeEventListener("visibilitychange", refreshIfVisible);
			window.removeEventListener("online", refreshIfVisible);
		};

		const echo = getEcho();
		if (!echo) {
			return cleanUpRefresh;
		}

		console.log("[Timer] Subscribing to channel user." + user.userId);

		// Subscribe to private channel
		const channel = echo.private(`user.${user.userId}`);
		channelRef.current = channel;

		channel
			.listen(".timer.updated", (event: TimerUpdateEvent) => {
				console.log("[Timer] Received event:", event);
				if (event.timeEntry?.isActive) {
					setActiveTimer(event.timeEntry);
					setResumableTimer(null);
				} else {
					void fetchActiveTimer();
				}
			})
			.subscribed(() => {
				console.log("[Timer] Successfully subscribed to channel");
				setIsConnected(true);
			})
			.error((error: unknown) => {
				console.error("[Timer] Subscription error:", error);
				setIsConnected(false);
			});

		return () => {
			cleanUpRefresh();
			console.log("[Timer] Leaving channel");
			if (channelRef.current) {
				echo.leave(`user.${user.userId}`);
				channelRef.current = null;
				setIsConnected(false);
			}
		};
	}, [user?.userId, fetchActiveTimer, setActiveTimer, setIsConnected, setResumableTimer]);
}

// Hook to use timer state (use in any component)
export function useRealtimeTimer() {
	const { activeTimer, resumableTimer, isLoading, isConnected, setActiveTimer, setResumableTimer } = useTimerStore();

	const refetch = synchronizeTimer;

	return { activeTimer, resumableTimer, setActiveTimer, setResumableTimer, isLoading, isConnected, refetch };
}
