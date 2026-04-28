import type { AttendanceFilters } from "./types";

export const attendanceKeys = {
	all: ["attendances"] as const,
	today: () => [...attendanceKeys.all, "today"] as const,
	history: (dateFrom?: string, dateTo?: string, perPage?: number) => [...attendanceKeys.all, "history", dateFrom, dateTo, perPage] as const,
	summary: (year?: number, month?: number) => [...attendanceKeys.all, "summary", year, month] as const,
	lists: () => [...attendanceKeys.all, "list"] as const,
	list: (filters?: AttendanceFilters) => [...attendanceKeys.lists(), filters] as const,
};

