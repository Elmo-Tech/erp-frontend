import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "../api";
import type { AttendanceFilters, UpdateAttendancePayload } from "../types";

export const attendanceKeys = {
	all: ["attendance"] as const,
	today: () => [...attendanceKeys.all, "today"] as const,
	history: (dateFrom?: string, dateTo?: string) => [...attendanceKeys.all, "history", dateFrom, dateTo] as const,
	summary: (year?: number, month?: number) => [...attendanceKeys.all, "summary", year, month] as const,
	lists: () => [...attendanceKeys.all, "list"] as const,
	list: (filters?: AttendanceFilters) => [...attendanceKeys.lists(), filters] as const,
};

export function useTodayAttendance() {
	return useQuery({
		queryKey: attendanceKeys.today(),
		queryFn: () => attendanceApi.getToday(),
		refetchInterval: 60000, // Refetch every minute
	});
}

export function useAttendanceHistory(dateFrom?: string, dateTo?: string, perPage = 15) {
	return useQuery({
		queryKey: attendanceKeys.history(dateFrom, dateTo),
		queryFn: () => attendanceApi.getHistory(dateFrom, dateTo, perPage),
	});
}

export function useAttendanceSummary(year?: number, month?: number) {
	return useQuery({
		queryKey: attendanceKeys.summary(year, month),
		queryFn: () => attendanceApi.getSummary(year, month),
	});
}

export function useAllAttendance(filters?: AttendanceFilters) {
	return useQuery({
		queryKey: attendanceKeys.list(filters),
		queryFn: () => attendanceApi.getAll(filters),
	});
}

export function useClockOut() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => attendanceApi.clockOut(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceKeys.today() });
			queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
		},
	});
}

export function useUpdateAttendance() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateAttendancePayload }) => attendanceApi.update(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
		},
	});
}
