"use client";

import { useEffect, useCallback, useRef } from "react";
import { getEcho } from "@/lib/echo";
import { useAuthStore } from "@/store/authStore";
import { TimeEntryData, useTimerStore } from "@/store/timerStore";
import api from "@/lib/axios";

interface TimerUpdateEvent {
	action: string;
	timeEntry: TimeEntryData | null;
}

let isInitialized = false;

// Hook to initialize WebSocket connection (call once in layout/provider)
export function useTimerSocketInit() {
	const { user } = useAuthStore();
	const { activeTimer, setActiveTimer, setResumableTimer, setIsLoading, setIsConnected } = useTimerStore();
	const channelRef = useRef<unknown>(null);

	// Initial fetch
	const fetchActiveTimer = useCallback(async () => {
		try {
			const [activeResponse, resumableResponse] = await Promise.all([
				api.get<{ data: TimeEntryData | null }>("/time-entries/active"),
				api.get<{ data: TimeEntryData | null }>("/time-entries/resumable"),
			]);
			const activeData = activeResponse.data.data;
			if (activeData && activeData.isActive) {
				setActiveTimer(activeData);
				setResumableTimer(null);
			} else {
				setActiveTimer(null);
				setResumableTimer(resumableResponse.data.data);
			}
		} catch {
			setActiveTimer(null);
		} finally {
			setIsLoading(false);
		}
	}, [setActiveTimer, setIsLoading, setResumableTimer]);

	useEffect(() => {
		if (!activeTimer?.sessionId) {
			return;
		}

		const sendHeartbeat = async () => {
			if (!navigator.onLine) {
				return;
			}

			try {
				await api.post(
					"/time-entries/heartbeat",
					{
						timeEntryId: activeTimer.timeEntryId,
						sessionId: activeTimer.sessionId,
					},
					{ skipErrorToast: true }
				);
			} catch (error: unknown) {
				const status = (error as { response?: { status?: number } }).response?.status;
				if (status === 409) {
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
			window.clearInterval(interval);
			document.removeEventListener("visibilitychange", handleVisibilityOrOnline);
			window.removeEventListener("online", handleVisibilityOrOnline);
		};
	}, [activeTimer?.sessionId, activeTimer?.timeEntryId, fetchActiveTimer]);

	// Subscribe to WebSocket
	useEffect(() => {
		if (isInitialized) return;

		fetchActiveTimer();

		if (!user?.userId) return;

		const echo = getEcho();
		if (!echo) {
			console.log("[Timer] Echo not available");
			return;
		}

		isInitialized = true;
		console.log("[Timer] Subscribing to channel user." + user.userId);

		// Subscribe to private channel
		const channel = echo.private(`user.${user.userId}`);
		channelRef.current = channel;

		channel
			.listen(".timer.updated", (event: TimerUpdateEvent) => {
				console.log("[Timer] Received event:", event);
				if (event.action === "started" && event.timeEntry) {
					setActiveTimer(event.timeEntry);
					setResumableTimer(null);
				} else {
					setActiveTimer(null);
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
			console.log("[Timer] Leaving channel");
			if (channelRef.current) {
				echo.leave(`user.${user.userId}`);
				channelRef.current = null;
				isInitialized = false;
			}
		};
	}, [user?.userId, fetchActiveTimer, setActiveTimer, setIsConnected, setResumableTimer]);
}

// Hook to use timer state (use in any component)
export function useRealtimeTimer() {
	const { activeTimer, resumableTimer, isLoading, isConnected, setActiveTimer, setResumableTimer } = useTimerStore();

	const refetch = useCallback(async () => {
		try {
			const [activeResponse, resumableResponse] = await Promise.all([
				api.get<{ data: TimeEntryData | null }>("/time-entries/active"),
				api.get<{ data: TimeEntryData | null }>("/time-entries/resumable"),
			]);
			const data = activeResponse.data.data;
			if (data && data.isActive) {
				setActiveTimer(data);
				setResumableTimer(null);
			} else {
				setActiveTimer(null);
				setResumableTimer(resumableResponse.data.data);
			}
		} catch {
			setActiveTimer(null);
		}
	}, [setActiveTimer, setResumableTimer]);

	return { activeTimer, resumableTimer, setActiveTimer, setResumableTimer, isLoading, isConnected, refetch };
}
