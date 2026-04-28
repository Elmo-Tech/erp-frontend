"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "@/entities/task/model/query-keys";
import { timeEntryApi } from "@/entities/time-entry/api/time-entry.api";
import { timeEntryKeys } from "@/entities/time-entry/model/query-keys";
import type { ActiveTimer, StartTimerPayload, TimeEntry, TimeEntryFilters, TimeEntryListResponse, UpdateTimeEntryPayload } from "@/entities/time-entry/model/types";
import { useTimerStore } from "./timer.store";
import { toApiTrackableType } from "@/shared/lib/time";

export function useTimeEntries(filters?: TimeEntryFilters) {
	return useQuery<TimeEntryListResponse, Error>({
		queryKey: timeEntryKeys.list(filters),
		queryFn: () => timeEntryApi.getTimeEntries(filters),
		staleTime: 2 * 60 * 1000,
	});
}

export function useTimeEntriesByTrackable(trackableType: string, trackableId: number, enabled = true) {
	const apiTrackableType = toApiTrackableType(trackableType);

	return useQuery<TimeEntryListResponse, Error>({
		queryKey: timeEntryKeys.byTrackable(trackableType, trackableId),
		queryFn: () => timeEntryApi.getTimeEntries({ trackableType: apiTrackableType, trackableId }),
		enabled: enabled && Boolean(trackableType) && Number.isFinite(trackableId) && trackableId > 0,
		staleTime: 2 * 60 * 1000,
	});
}

export function useActiveTimer(options?: { refetchInterval?: number | false }) {
	return useQuery<TimeEntry | null, Error>({
		queryKey: timeEntryKeys.active(),
		queryFn: timeEntryApi.getActive,
		staleTime: 10 * 1000,
		refetchInterval: options?.refetchInterval ?? 30 * 1000,
		refetchIntervalInBackground: true,
	});
}

export function useActiveTimers() {
	return useQuery<ActiveTimer[], Error>({
		queryKey: timeEntryKeys.activeTimers(),
		queryFn: timeEntryApi.getActiveTimers,
		staleTime: 15 * 1000,
		refetchInterval: 30 * 1000,
	});
}

export function useStartTimer() {
	const queryClient = useQueryClient();
	const setActiveTimer = useTimerStore((state) => state.setActiveTimer);

	return useMutation<TimeEntry, Error, StartTimerPayload>({
		mutationFn: timeEntryApi.start,
		onSuccess: (timeEntry) => {
			setActiveTimer({ ...timeEntry, isActive: true });
			queryClient.setQueryData(timeEntryKeys.active(), timeEntry);
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() });
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.activeTimers() });
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.byTrackable(timeEntry.trackableType, timeEntry.trackableId) });
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.byUser(timeEntry.userId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.all });
		},
	});
}

export function useStopTimer() {
	const queryClient = useQueryClient();
	const setActiveTimer = useTimerStore((state) => state.setActiveTimer);

	return useMutation<TimeEntry, Error, void>({
		mutationFn: timeEntryApi.stop,
		onSuccess: (timeEntry) => {
			setActiveTimer(null);
			queryClient.setQueryData(timeEntryKeys.active(), null);
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() });
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.activeTimers() });
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.byTrackable(timeEntry.trackableType, timeEntry.trackableId) });
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.byUser(timeEntry.userId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.all });
		},
	});
}

export function useUpdateTimeEntry() {
	const queryClient = useQueryClient();

	return useMutation<TimeEntry, Error, { id: number; payload: UpdateTimeEntryPayload }>({
		mutationFn: ({ id, payload }) => timeEntryApi.update(id, payload),
		onSuccess: (timeEntry) => {
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() });
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.byTrackable(timeEntry.trackableType, timeEntry.trackableId) });
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.byUser(timeEntry.userId) });
		},
	});
}

export function useStopTimerAdmin() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: timeEntryApi.stopTimerAdmin,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.activeTimers() });
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() });
		},
	});
}

