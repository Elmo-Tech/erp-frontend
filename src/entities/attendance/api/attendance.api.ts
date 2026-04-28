import api from "@/shared/api/base";
import type { Attendance, AttendanceFilters, AttendanceListResponse, AttendanceSummary, CreateAttendancePayload, TodayAttendanceResponse, UpdateAttendancePayload } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

function buildAttendanceParams(filters?: AttendanceFilters) {
	const params = new URLSearchParams();

	if (filters?.userId) {
		params.append("filter[userId]", String(filters.userId));
	}

	if (filters?.startDate) {
		params.append("filter[startDate]", filters.startDate);
	}

	if (filters?.endDate) {
		params.append("filter[endDate]", filters.endDate);
	}

	if (filters?.date) {
		params.append("filter[date]", filters.date);
	}

	if (filters?.page) {
		params.append("page", String(filters.page));
	}

	if (filters?.perPage) {
		params.append("perPage", String(filters.perPage));
	}

	return params;
}

export const attendanceApi = {
	async getToday(): Promise<TodayAttendanceResponse> {
		const response = await api.get<ApiEnvelope<TodayAttendanceResponse>>("/attendance/today");

		return response.data.data;
	},

	async getHistory(dateFrom?: string, dateTo?: string, perPage = 15): Promise<AttendanceListResponse> {
		const params = new URLSearchParams({ perPage: String(perPage) });

		if (dateFrom) {
			params.append("dateFrom", dateFrom);
		}

		if (dateTo) {
			params.append("dateTo", dateTo);
		}

		const response = await api.get<ApiEnvelope<AttendanceListResponse>>(`/attendance/history?${params.toString()}`);

		return response.data.data;
	},

	async getSummary(year?: number, month?: number): Promise<AttendanceSummary> {
		const params = new URLSearchParams();

		if (year) {
			params.append("year", String(year));
		}

		if (month) {
			params.append("month", String(month));
		}

		const query = params.toString();
		const response = await api.get<ApiEnvelope<AttendanceSummary>>(query ? `/attendance/summary?${query}` : "/attendance/summary");

		return response.data.data;
	},

	async clockOut(): Promise<Attendance> {
		const response = await api.post<ApiEnvelope<Attendance>>("/attendance/clock-out");

		return response.data.data;
	},

	async getAll(filters?: AttendanceFilters): Promise<AttendanceListResponse> {
		const params = buildAttendanceParams(filters);
		const query = params.toString();
		const response = await api.get<ApiEnvelope<AttendanceListResponse>>(query ? `/attendance/all?${query}` : "/attendance/all");

		return response.data.data;
	},

	async create(payload: CreateAttendancePayload): Promise<Attendance> {
		const response = await api.post<ApiEnvelope<Attendance>>("/attendance", payload);

		return response.data.data;
	},

	async update(id: number, payload: UpdateAttendancePayload): Promise<Attendance> {
		const response = await api.put<ApiEnvelope<Attendance>>(`/attendance/${id}`, payload);

		return response.data.data;
	},
};

