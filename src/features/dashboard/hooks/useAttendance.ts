/**
 * Attendance Hooks
 * TanStack Query hooks for smart attendance tracking
 *
 * Requirements: 14.1, 14.5
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "../api/attendance";
import { TodayAttendance, Attendance } from "../types/attendance";

/**
 * Query keys for consistent cache management
 */
export const attendanceKeys = {
	all: ["attendance"] as const,
	today: () => [...attendanceKeys.all, "today"] as const,
	history: () => [...attendanceKeys.all, "history"] as const,
	userHistory: (userId: number) => [...attendanceKeys.history(), userId] as const,
};

/**
 * Hook to fetch today's attendance record with context
 * Requirement 14.1: Frontend hooks for attendance operations
 */
export const useTodayAttendance = () => {
	return useQuery<TodayAttendance, Error>({
		queryKey: attendanceKeys.today(),
		queryFn: attendanceApi.getTodayAttendance,
		staleTime: 1 * 60 * 1000, // 1 minute (more frequent updates for attendance)
		gcTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 60 * 1000, // Refetch every minute to keep attendance current
		refetchIntervalInBackground: false, // Only refetch when tab is active
	});
};

/**
 * Hook to clock out and calculate idle time
 * Requirement 14.5: Frontend hooks for attendance operations
 */
export const useClockOut = () => {
	const queryClient = useQueryClient();

	return useMutation<Attendance, Error, void>({
		mutationFn: attendanceApi.clockOut,
		onSuccess: (updatedAttendance) => {
			// Update today's attendance cache with the new data
			queryClient.setQueryData(attendanceKeys.today(), (oldData: TodayAttendance | undefined) => {
				if (!oldData) return oldData;

				return {
					...oldData,
					attendance: updatedAttendance,
					currentIdleMinutes: updatedAttendance.idleMinutes,
				};
			});

			// Invalidate to ensure fresh data on next fetch
			queryClient.invalidateQueries({ queryKey: attendanceKeys.today() });
		},
		onError: (error) => {
			console.error("Failed to clock out:", error);
		},
	});
};

/**
 * Hook to get real-time attendance status
 * Combines attendance data with computed values
 */
export const useAttendanceStatus = () => {
	const { data: todayAttendance, isLoading, error, refetch } = useTodayAttendance();

	// Compute derived values
	const isClocked = !!todayAttendance?.attendance?.clockIn;
	const isClockedOut = !!todayAttendance?.attendance?.clockOut;
	const hasActiveTimer = todayAttendance?.hasActiveTimer || false;
	const totalWorkedMinutes = todayAttendance?.totalWorkedMinutes || 0;
	const currentIdleMinutes = todayAttendance?.currentIdleMinutes;

	// Calculate current work duration if clocked in but not out
	const getCurrentWorkDuration = (): number => {
		if (!todayAttendance?.attendance?.clockIn || isClockedOut) {
			return totalWorkedMinutes;
		}

		const clockInTime = new Date(todayAttendance.attendance.clockIn);
		const now = new Date();
		const totalMinutes = Math.floor((now.getTime() - clockInTime.getTime()) / (1000 * 60));

		return Math.max(0, totalMinutes);
	};

	// Calculate current idle time if clocked in but not out
	const getCurrentIdleTime = (): number => {
		if (isClockedOut) {
			return currentIdleMinutes || 0;
		}

		if (!isClocked) {
			return 0;
		}

		const totalDuration = getCurrentWorkDuration();
		return Math.max(0, totalDuration - totalWorkedMinutes);
	};

	// Format time duration for display
	const formatDuration = (minutes: number): string => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;

		if (hours > 0) {
			return `${hours}h ${mins}m`;
		}
		return `${mins}m`;
	};

	// Get attendance summary for display
	const getAttendanceSummary = () => {
		if (!isClocked) {
			return {
				status: "not_clocked_in" as const,
				message: "Not clocked in",
				clockInTime: null,
				clockOutTime: null,
				totalDuration: "0m",
				workedDuration: "0m",
				idleDuration: "0m",
			};
		}

		const clockInTime = todayAttendance?.attendance?.clockIn || null;
		const clockOutTime = todayAttendance?.attendance?.clockOut || null;
		const totalDuration = getCurrentWorkDuration();
		const idleTime = getCurrentIdleTime();

		return {
			status: isClockedOut ? ("clocked_out" as const) : ("clocked_in" as const),
			message: isClockedOut ? "Clocked out" : "Currently working",
			clockInTime,
			clockOutTime,
			totalDuration: formatDuration(totalDuration),
			workedDuration: formatDuration(totalWorkedMinutes),
			idleDuration: formatDuration(idleTime),
			hasActiveTimer,
		};
	};

	return {
		// Raw data
		todayAttendance,
		isLoading,
		error,
		refetch,

		// Computed status
		isClocked,
		isClockedOut,
		hasActiveTimer,
		totalWorkedMinutes,
		currentIdleMinutes,

		// Helper functions
		getCurrentWorkDuration,
		getCurrentIdleTime,
		formatDuration,
		getAttendanceSummary,

		// Summary object
		summary: getAttendanceSummary(),
	};
};

/**
 * Hook to prefetch today's attendance (useful for dashboard initialization)
 */
export const usePrefetchTodayAttendance = () => {
	const queryClient = useQueryClient();

	return () => {
		queryClient.prefetchQuery({
			queryKey: attendanceKeys.today(),
			queryFn: attendanceApi.getTodayAttendance,
			staleTime: 1 * 60 * 1000, // 1 minute
		});
	};
};

/**
 * Hook to manually refresh attendance data
 * Useful for force-refresh after timer operations
 */
export const useRefreshAttendance = () => {
	const queryClient = useQueryClient();

	return () => {
		queryClient.invalidateQueries({ queryKey: attendanceKeys.today() });
	};
};
