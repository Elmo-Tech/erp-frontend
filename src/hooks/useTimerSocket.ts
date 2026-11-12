"use client";

import { useEffect, useRef } from "react";
import { subscribeWithFallback } from "@/lib/realtimeSubscription";
import { useAuthStore } from "@/store/authStore";
import { TimeEntryData, useTimerStore } from "@/store/timerStore";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";

let synchronizationVersion = 0;
export async function synchronizeTimer() {
	const version = ++synchronizationVersion;
	const userId = useAuthStore.getState().user?.userId;
	const snapshot = useTimerStore.getState();
	try {
		const activeResponse = await api.get<{ data: TimeEntryData[] }>("/time-entries/my-active", { skipErrorToast: true });
		const timers = activeResponse.data.data;
		const candidate = (await api.get<{ data: TimeEntryData | null }>("/time-entries/resumable", { skipErrorToast: true })).data.data;
		const resumableTimer = candidate && !timers.some((item) => item.trackableType === candidate.trackableType && item.trackableId === candidate.trackableId) ? candidate : null;
		const current = useTimerStore.getState();
		if (version !== synchronizationVersion || useAuthStore.getState().user?.userId !== userId || current.activeTimers !== snapshot.activeTimers || current.resumableTimer !== snapshot.resumableTimer) return;
		current.setActiveTimers(timers);
		useTimerStore.setState({ resumableTimer });
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
	const { activeTimer, activeTimers, resumableTimer, isLoading, setIsConnected } = useTimerStore();
	const lastTimerState = useRef<string | null>(null);
	const activeId = activeTimer?.timeEntryId;
	const resumableId = resumableTimer?.timeEntryId;
	useEffect(() => {
		if (isLoading) return;
		const signature = `${activeTimers.map((timer) => timer.timeEntryId).sort().join(",")}:${resumableId ?? "none"}`;
		if (lastTimerState.current !== null && lastTimerState.current !== signature) {
			void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
			void queryClient.invalidateQueries({ queryKey: ["timeEntries", "activeTimers"] });
		}
		lastTimerState.current = signature;
	}, [activeId, activeTimers, resumableId, isLoading, queryClient]);

	// Initial fetch
	const fetchActiveTimer = synchronizeTimer;

	const timerSignature = activeTimers.map((timer) => `${timer.timeEntryId}:${timer.sessionId}`).join(",");
	useEffect(() => {
		if (!timerSignature) return;
		let disposed = false;
		const sendHeartbeat = async () => {
			if (!navigator.onLine) return;
			await Promise.all(useTimerStore.getState().activeTimers.map(async (timer) => {
				if (!timer.sessionId) return;
				try {
					const response = await api.post<{ data: TimeEntryData }>("/time-entries/heartbeat", { timeEntryId: timer.timeEntryId, sessionId: timer.sessionId }, { skipErrorToast: true, skipSuccessToast: true });
					const current = useTimerStore.getState();
					if (!disposed && current.activeTimers.some((item) => item.timeEntryId === timer.timeEntryId && item.sessionId === timer.sessionId) && response.data.data.isActive) current.setActiveTimers(current.activeTimers.map((item) => item.timeEntryId === timer.timeEntryId ? response.data.data : item));
				} catch (error: unknown) { if (!disposed && (error as { response?: { status?: number } }).response?.status === 409) await fetchActiveTimer(); }
			}));
		};
		const handleVisibilityOrOnline = () => { if (document.visibilityState === "visible" && navigator.onLine) void sendHeartbeat(); };
		void sendHeartbeat();
		const interval = window.setInterval(sendHeartbeat, 45_000);
		document.addEventListener("visibilitychange", handleVisibilityOrOnline);
		window.addEventListener("online", handleVisibilityOrOnline);
		return () => { disposed = true; window.clearInterval(interval); document.removeEventListener("visibilitychange", handleVisibilityOrOnline); window.removeEventListener("online", handleVisibilityOrOnline); };
	}, [timerSignature, fetchActiveTimer]);

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
