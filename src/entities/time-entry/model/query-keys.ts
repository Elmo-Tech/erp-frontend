import type { TimeEntryFilters } from "./types";

export const timeEntryKeys = {
	all: ["time-entries"] as const,
	lists: () => [...timeEntryKeys.all, "list"] as const,
	list: (filters?: TimeEntryFilters) => [...timeEntryKeys.lists(), filters] as const,
	active: () => [...timeEntryKeys.all, "active"] as const,
	activeTimers: () => [...timeEntryKeys.all, "active-timers"] as const,
	byTrackable: (trackableType: string, trackableId: number) => [...timeEntryKeys.all, "trackable", trackableType, trackableId] as const,
	byUser: (userId: number) => [...timeEntryKeys.all, "user", userId] as const,
};

