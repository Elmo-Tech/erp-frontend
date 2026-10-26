"use client";

import { useEffect, useRef } from "react";
import { subscribeWithFallback } from "@/lib/realtimeSubscription";
import { useAuthStore } from "@/store/authStore";
import { TimeEntryData, useTimerStore } from "@/store/timerStore";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";

let synchronizationVersion = 0;
async function synchronizeTimer() {
	const version = ++synchronizationVersion;
	const userId = useAuthStore.getState().user?.userId;
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
		if (version !== synchronizationVersion || useAuthStore.getState().user?.userId !== userId
			|| current.activeTimer !== snapshot.activeTimer || current.resumableTimer !== snapshot.resumableTimer) return;
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
	const { activeTimer, resumableTimer, isLoading, setIsConnected } = useTimerStore();
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
		return subscribeWithFallback({
			channelName: `user.${user.userId}`,
			event: ".timer.updated",
			onEvent: () => { void fetchActiveTimer(); },
			onRefresh: () => { void fetchActiveTimer(); },
			onConnectionChange: setIsConnected,
		});
	}, [user?.userId, fetchActiveTimer, setIsConnected]);
}

// Hook to use timer state (use in any component)
export function useRealtimeTimer() {
	const { activeTimer, resumableTimer, isLoading, isConnected, setActiveTimer, setResumableTimer } = useTimerStore();

	const refetch = synchronizeTimer;

	return { activeTimer, resumableTimer, setActiveTimer, setResumableTimer, isLoading, isConnected, refetch };
}
