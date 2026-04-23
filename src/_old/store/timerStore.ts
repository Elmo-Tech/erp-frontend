import { create } from "zustand";

interface TimeEntryData {
	timeEntryId: number;
	startTime: string;
	trackableType: string;
	trackableId: number;
	trackableDisplayName: string;
	isActive: boolean;
}

interface TimerStore {
	activeTimer: TimeEntryData | null;
	isLoading: boolean;
	isConnected: boolean;
	setActiveTimer: (timer: TimeEntryData | null) => void;
	setIsLoading: (loading: boolean) => void;
	setIsConnected: (connected: boolean) => void;
}

export const useTimerStore = create<TimerStore>((set) => ({
	activeTimer: null,
	isLoading: true,
	isConnected: false,
	setActiveTimer: (timer) => set({ activeTimer: timer }),
	setIsLoading: (loading) => set({ isLoading: loading }),
	setIsConnected: (connected) => set({ isConnected: connected }),
}));
