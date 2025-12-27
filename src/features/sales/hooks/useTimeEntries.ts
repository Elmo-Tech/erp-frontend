import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { timeEntriesApi } from "../api/timeEntries";
import { TimeEntry, StartTimerPayload, ActiveTimerResponse, TimeEntryFilters, TimeEntryListResponse } from "../types/timeEntry";

/**
 * TanStack Query hooks for time entry management
 * Implements requirements 11.3, 11.4: Frontend hooks for time tracking operations
 */

// Query keys for consistent cache management
export const timeEntryKeys = {
	all: ["timeEntries"] as const,
	lists: () => [...timeEntryKeys.all, "list"] as const,
	list: (filters?: TimeEntryFilters) => [...timeEntryKeys.lists(), filters] as const,
	active: () => [...timeEntryKeys.all, "active"] as const,
	byTrackable: (trackableType: string, trackableId: number) => [...timeEntryKeys.all, "byTrackable", trackableType, trackableId] as const,
	byUser: (userId: number) => [...timeEntryKeys.all, "byUser", userId] as const,
};

/**
 * Hook to fetch all time entries with optional filtering and pagination
 * Requirement 11.3: Frontend hooks for time tracking operations
 */
export const useTimeEntries = (filters?: TimeEntryFilters) => {
	return useQuery<TimeEntryListResponse, Error>({
		queryKey: timeEntryKeys.list(filters),
		queryFn: () => timeEntriesApi.getAll(filters),
		staleTime: 2 * 60 * 1000, // 2 minutes (shorter for time tracking data)
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
};

/**
 * Hook to fetch the current user's active timer
 * Requirement 11.4: Frontend hooks for time tracking operations
 */
export const useActiveTimer = (options?: { refetchInterval?: number }) => {
	const { refetchInterval = 30000 } = options || {}; // Default 30 seconds

	return useQuery<ActiveTimerResponse, Error>({
		queryKey: timeEntryKeys.active(),
		queryFn: timeEntriesApi.getActive,
		staleTime: 10 * 1000, // 10 seconds (very fresh for active timer)
		gcTime: 2 * 60 * 1000, // 2 minutes
		refetchInterval, // Automatically refetch to keep timer updated
		refetchIntervalInBackground: true, // Continue refetching when tab is not active
	});
};

/**
 * Hook to fetch time entries for a specific trackable entity
 * Requirement 11.3: Frontend hooks for time tracking operations
 */
export const useTimeEntriesByTrackable = (trackableType: string, trackableId: number, enabled = true) => {
	return useQuery<TimeEntryListResponse, Error>({
		queryKey: timeEntryKeys.byTrackable(trackableType, trackableId),
		queryFn: () =>
			timeEntriesApi.getAll({
				trackableType: trackableType as any,
				trackableId,
			}),
		enabled: enabled && !!trackableType && !!trackableId,
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
};

/**
 * Hook to fetch time entries for a specific user
 * Requirement 11.3: Frontend hooks for time tracking operations
 */
export const useTimeEntriesByUser = (userId: number, enabled = true) => {
	return useQuery<TimeEntryListResponse, Error>({
		queryKey: timeEntryKeys.byUser(userId),
		queryFn: () => timeEntriesApi.getAll({ userId }),
		enabled: enabled && !!userId,
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
};

/**
 * Hook to start a timer for a trackable entity
 * Requirement 11.4: Frontend hooks for time tracking operations
 */
export const useStartTimer = () => {
	const queryClient = useQueryClient();

	return useMutation<TimeEntry, Error, StartTimerPayload>({
		mutationFn: timeEntriesApi.start,
		onSuccess: (newTimeEntry) => {
			// Invalidate active timer query to show the new active timer
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.active() });

			// Invalidate time entries lists to show the new entry
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() });

			// Invalidate time entries for the specific trackable entity
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.byTrackable(newTimeEntry.trackableType, newTimeEntry.trackableId),
			});

			// Invalidate time entries for the user
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.byUser(newTimeEntry.userId),
			});
		},
		onError: (error) => {
			console.error("Failed to start timer:", error);
		},
	});
};

/**
 * Hook to stop the active timer
 * Requirement 11.4: Frontend hooks for time tracking operations
 */
export const useStopTimer = () => {
	const queryClient = useQueryClient();

	return useMutation<TimeEntry, Error, void>({
		mutationFn: timeEntriesApi.stop,
		onSuccess: (stoppedTimeEntry) => {
			// Invalidate active timer query to clear the active timer
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.active() });

			// Invalidate time entries lists to show the updated entry
			queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() });

			// Invalidate time entries for the specific trackable entity
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.byTrackable(stoppedTimeEntry.trackableType, stoppedTimeEntry.trackableId),
			});

			// Invalidate time entries for the user
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.byUser(stoppedTimeEntry.userId),
			});
		},
		onError: (error) => {
			console.error("Failed to stop timer:", error);
		},
	});
};

/**
 * Hook to check if a timer is currently running
 * Requirement 11.4: Frontend hooks for time tracking operations
 */
export const useIsTimerRunning = () => {
	const { data: activeTimer } = useActiveTimer();
	return activeTimer?.isActive || false;
};

/**
 * Hook to get the current active time entry
 * Requirement 11.4: Frontend hooks for time tracking operations
 */
export const useCurrentTimeEntry = () => {
	const { data: activeTimer, ...rest } = useActiveTimer();
	return {
		...rest,
		data: activeTimer?.timeEntry || null,
		isActive: activeTimer?.isActive || false,
	};
};

/**
 * Hook to prefetch time entries for a trackable entity
 * Useful for hover states or navigation
 */
export const usePrefetchTimeEntries = () => {
	const queryClient = useQueryClient();

	return (trackableType: string, trackableId: number) => {
		queryClient.prefetchQuery({
			queryKey: timeEntryKeys.byTrackable(trackableType, trackableId),
			queryFn: () =>
				timeEntriesApi.getAll({
					trackableType: trackableType as any,
					trackableId,
				}),
			staleTime: 2 * 60 * 1000, // 2 minutes
		});
	};
};

/**
 * Hook to calculate total time spent on a trackable entity
 * Requirement 11.3: Frontend hooks for time tracking operations
 */
export const useTotalTimeForTrackable = (trackableType: string, trackableId: number) => {
	const { data: timeEntries } = useTimeEntriesByTrackable(trackableType, trackableId);

	const totalMinutes =
		timeEntries?.timeEntries.reduce((total, entry) => {
			return total + (entry.durationMinutes || 0);
		}, 0) || 0;

	return {
		totalMinutes,
		totalHours: Math.round((totalMinutes / 60) * 100) / 100, // Round to 2 decimal places
		formattedTime: formatDuration(totalMinutes),
	};
};

/**
 * Utility function to format duration in minutes to human-readable format
 */
const formatDuration = (minutes: number): string => {
	if (minutes < 60) {
		return `${minutes}m`;
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (remainingMinutes === 0) {
		return `${hours}h`;
	}

	return `${hours}h ${remainingMinutes}m`;
};
