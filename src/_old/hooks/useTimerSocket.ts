"use client";

import { useEffect, useCallback, useRef } from "react";
import { getEcho } from "@/_old/lib/echo";
import { useAuthStore } from "@/_old/store/authStore";
import { useTimerStore } from "@/_old/store/timerStore";
import api from "@/shared/api/base";

interface TimeEntryData {
	timeEntryId: number;
	startTime: string;
	trackableType: string;
	trackableId: number;
	trackableDisplayName: string;
	isActive: boolean;
}

interface TimerUpdateEvent {
	action: "started" | "stopped";
	timeEntry: TimeEntryData | null;
}

let isInitialized = false;

// Hook to initialize WebSocket connection (call once in layout/provider)
export function useTimerSocketInit() {
	const { user } = useAuthStore();
	const { setActiveTimer, setIsLoading, setIsConnected } = useTimerStore();
	const channelRef = useRef<unknown>(null);

	// Initial fetch
	const fetchActiveTimer = useCallback(async () => {
		try {
			const response = await api.get<{ data: TimeEntryData | null }>("/time-entries/active");
			const data = response.data.data;
			if (data && data.isActive) {
				setActiveTimer(data);
			} else {
				setActiveTimer(null);
			}
		} catch {
			setActiveTimer(null);
		} finally {
			setIsLoading(false);
		}
	}, [setActiveTimer, setIsLoading]);

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
				} else if (event.action === "stopped") {
					setActiveTimer(null);
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
	}, [user?.userId, fetchActiveTimer, setActiveTimer, setIsConnected]);
}

// Hook to use timer state (use in any component)
export function useRealtimeTimer() {
	const { activeTimer, isLoading, isConnected, setActiveTimer } = useTimerStore();

	const refetch = useCallback(async () => {
		try {
			const response = await api.get<{ data: TimeEntryData | null }>("/time-entries/active");
			const data = response.data.data;
			if (data && data.isActive) {
				setActiveTimer(data);
			} else {
				setActiveTimer(null);
			}
		} catch {
			setActiveTimer(null);
		}
	}, [setActiveTimer]);

	return { activeTimer, setActiveTimer, isLoading, isConnected, refetch };
}
