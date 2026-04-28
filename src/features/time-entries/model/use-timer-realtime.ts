"use client";

import { useCallback, useEffect, useRef } from "react";
import type { TimeEntry } from "@/entities/time-entry/model/types";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { getEcho } from "@/shared/realtime/echo";
import { timeEntryApi } from "@/entities/time-entry/api/time-entry.api";
import { useTimerStore } from "./timer.store";

interface TimerUpdateEvent {
	action: "started" | "stopped";
	timeEntry: TimeEntry | null;
}

interface RealtimeChannel {
	listen: (event: string, callback: (payload: TimerUpdateEvent) => void) => RealtimeChannel;
	subscribed: (callback: () => void) => RealtimeChannel;
	error: (callback: () => void) => RealtimeChannel;
}

let activeSubscriptionUserId: number | null = null;

export function useTimerRealtimeInit() {
	const userId = useAuthStore((state) => state.user?.userId);
	const setActiveTimer = useTimerStore((state) => state.setActiveTimer);
	const setIsLoading = useTimerStore((state) => state.setIsLoading);
	const setIsConnected = useTimerStore((state) => state.setIsConnected);
	const channelRef = useRef<RealtimeChannel | null>(null);

	const fetchActiveTimer = useCallback(async () => {
		try {
			const activeTimer = await timeEntryApi.getActive();
			setActiveTimer(activeTimer?.isActive === false ? null : activeTimer);
		} catch {
			setActiveTimer(null);
		} finally {
			setIsLoading(false);
		}
	}, [setActiveTimer, setIsLoading]);

	useEffect(() => {
		fetchActiveTimer();

		if (!userId || activeSubscriptionUserId === userId) {
			return;
		}

		const echo = getEcho();
		if (!echo) {
			setIsConnected(false);
			return;
		}

		activeSubscriptionUserId = userId;
		const channel = echo.private(`user.${userId}`) as unknown as RealtimeChannel;
		channelRef.current = channel;

		channel
			.listen(".timer.updated", (event) => {
				setActiveTimer(event.action === "started" ? event.timeEntry : null);
			})
			.subscribed(() => setIsConnected(true))
			.error(() => setIsConnected(false));

		return () => {
			echo.leave(`user.${userId}`);
			channelRef.current = null;
			activeSubscriptionUserId = null;
			setIsConnected(false);
		};
	}, [fetchActiveTimer, setActiveTimer, setIsConnected, userId]);
}

export function useRealtimeTimer() {
	const activeTimer = useTimerStore((state) => state.activeTimer);
	const isLoading = useTimerStore((state) => state.isLoading);
	const isConnected = useTimerStore((state) => state.isConnected);
	const setActiveTimer = useTimerStore((state) => state.setActiveTimer);

	const refetch = useCallback(async () => {
		const timer = await timeEntryApi.getActive();
		setActiveTimer(timer?.isActive === false ? null : timer);
		return timer;
	}, [setActiveTimer]);

	return { activeTimer, isLoading, isConnected, refetch };
}

