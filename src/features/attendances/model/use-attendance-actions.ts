"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@/entities/attendance/api/attendance.api";
import { attendanceKeys } from "@/entities/attendance/model/query-keys";
import type { Attendance, AttendanceFilters, AttendanceListResponse, TodayAttendanceResponse, UpdateAttendancePayload } from "@/entities/attendance/model/types";
import { getElapsedMinutes, formatMinutesCompact } from "@/shared/lib/time";

export function useTodayAttendance() {
	return useQuery<TodayAttendanceResponse, Error>({
		queryKey: attendanceKeys.today(),
		queryFn: attendanceApi.getToday,
		staleTime: 60 * 1000,
		refetchInterval: 60 * 1000,
		refetchIntervalInBackground: false,
	});
}

export function useAttendanceHistory(dateFrom?: string, dateTo?: string, perPage = 15) {
	return useQuery<AttendanceListResponse, Error>({
		queryKey: attendanceKeys.history(dateFrom, dateTo, perPage),
		queryFn: () => attendanceApi.getHistory(dateFrom, dateTo, perPage),
		staleTime: 5 * 60 * 1000,
	});
}

export function useAllAttendance(filters?: AttendanceFilters) {
	return useQuery<AttendanceListResponse, Error>({
		queryKey: attendanceKeys.list(filters),
		queryFn: () => attendanceApi.getAll(filters),
	});
}

export function useClockOut() {
	const queryClient = useQueryClient();

	return useMutation<Attendance, Error, void>({
		mutationFn: attendanceApi.clockOut,
		onSuccess: (attendance) => {
			queryClient.setQueryData<TodayAttendanceResponse | undefined>(attendanceKeys.today(), (current) => {
				if (!current) {
					return current;
				}

				return { ...current, attendance };
			});
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
		},
	});
}

export function useUpdateAttendance() {
	const queryClient = useQueryClient();

	return useMutation<Attendance, Error, { id: number; payload: UpdateAttendancePayload }>({
		mutationFn: ({ id, payload }) => attendanceApi.update(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
		},
	});
}

export function useAttendanceStatus() {
	const todayQuery = useTodayAttendance();
	const todayAttendance = todayQuery.data;
	const attendance = todayAttendance?.attendance ?? null;
	const isClocked = Boolean(attendance?.clockIn);
	const isClockedOut = Boolean(attendance?.clockOut);
	const hasActiveTimer = todayAttendance?.hasActiveTimer ?? false;
	const totalWorkedMinutes = todayAttendance?.totalWorkedMinutes ?? 0;

	const summary = useMemo(() => {
		if (!attendance?.clockIn) {
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

		const totalDurationMinutes = attendance.clockOut ? attendance.workedMinutes + attendance.idleMinutes : getElapsedMinutes(attendance.clockIn);
		const idleMinutes = attendance.clockOut ? attendance.idleMinutes : Math.max(0, totalDurationMinutes - totalWorkedMinutes);

		return {
			status: isClockedOut ? ("clocked_out" as const) : ("clocked_in" as const),
			message: isClockedOut ? "Clocked out" : hasActiveTimer ? "Active work" : "On break",
			clockInTime: attendance.clockIn,
			clockOutTime: attendance.clockOut,
			totalDuration: formatMinutesCompact(totalDurationMinutes),
			workedDuration: formatMinutesCompact(totalWorkedMinutes || attendance.workedMinutes),
			idleDuration: formatMinutesCompact(idleMinutes),
		};
	}, [attendance, hasActiveTimer, isClockedOut, totalWorkedMinutes]);

	return {
		...todayQuery,
		todayAttendance,
		isClocked,
		isClockedOut,
		hasActiveTimer,
		totalWorkedMinutes,
		summary,
	};
}

