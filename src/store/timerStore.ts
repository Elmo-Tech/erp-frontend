import { create } from "zustand";

export interface TimeEntryData {
	timeEntryId: number;
	sessionId?: string;
	startTime: string;
	trackableType: string;
	trackableId: number;
	trackableDisplayName: string;
	trackableProjectId?: number | null;
	isActive: boolean;
	targetStatus?: "available" | "task_deleted" | "project_deleted" | "project_archived";
	targetMessage?: string | null;
	lastHeartbeatAt?: string;
	afterHoursPromptAt?: string | null;
	afterHoursGraceMinutes?: number;
	endTime?: string;
	stopReason?: "pause" | "hold" | "end" | "connection_lost" | "admin_stop" | "after_hours_timeout" | null;
}

interface TimerStore {
	activeTimer: TimeEntryData | null;
	resumableTimer: TimeEntryData | null;
	isLoading: boolean;
	isConnected: boolean;
	setActiveTimer: (timer: TimeEntryData | null) => void;
	setResumableTimer: (timer: TimeEntryData | null) => void;
	setIsLoading: (loading: boolean) => void;
	setIsConnected: (connected: boolean) => void;
}

export const useTimerStore = create<TimerStore>((set) => ({
	activeTimer: null,
	resumableTimer: null,
	isLoading: true,
	isConnected: false,
	setActiveTimer: (timer) => set({ activeTimer: timer }),
	setResumableTimer: (timer) => set({ resumableTimer: timer }),
	setIsLoading: (loading) => set({ isLoading: loading }),
	setIsConnected: (connected) => set({ isConnected: connected }),
}));
