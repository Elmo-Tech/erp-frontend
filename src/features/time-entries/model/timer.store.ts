"use client";

import { create } from "zustand";
import type { TimeEntry } from "@/entities/time-entry/model/types";

interface TimerState {
	activeTimer: TimeEntry | null;
	isLoading: boolean;
	isConnected: boolean;
	setActiveTimer: (timer: TimeEntry | null) => void;
	setIsLoading: (isLoading: boolean) => void;
	setIsConnected: (isConnected: boolean) => void;
}

export const useTimerStore = create<TimerState>((set) => ({
	activeTimer: null,
	isLoading: true,
	isConnected: false,
	setActiveTimer: (activeTimer) => set({ activeTimer }),
	setIsLoading: (isLoading) => set({ isLoading }),
	setIsConnected: (isConnected) => set({ isConnected }),
}));

