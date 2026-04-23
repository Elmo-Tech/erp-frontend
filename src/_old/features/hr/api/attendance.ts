import api from "@/shared/api/base";
import type { Attendance, AttendanceListResponse, AttendanceFilters, TodayAttendanceResponse, AttendanceSummary, UpdateAttendancePayload } from "../types";

const BASE_URL = "/attendance";

export const attendanceApi = {
	getToday: async (): Promise<TodayAttendanceResponse> => {
		const response = await api.get(`${BASE_URL}/today`);
		return response.data.data;
	},

	getHistory: async (dateFrom?: string, dateTo?: string, perPage = 15): Promise<AttendanceListResponse> => {
		const params: Record<string, string | number> = { perPage };
		if (dateFrom) params.dateFrom = dateFrom;
		if (dateTo) params.dateTo = dateTo;

		const response = await api.get(`${BASE_URL}/history`, { params });
		return response.data.data;
	},

	getSummary: async (year?: number, month?: number): Promise<AttendanceSummary> => {
		const params: Record<string, number> = {};
		if (year) params.year = year;
		if (month) params.month = month;

		const response = await api.get(`${BASE_URL}/summary`, { params });
		return response.data.data;
	},

	clockOut: async (): Promise<Attendance> => {
		const response = await api.post(`${BASE_URL}/clock-out`);
		return response.data.data;
	},

	getAll: async (filters?: AttendanceFilters): Promise<AttendanceListResponse> => {
		const params: Record<string, string | number> = {};

		if (filters?.userId) params["filter[userId]"] = filters.userId;
		if (filters?.startDate) params["filter[startDate]"] = filters.startDate;
		if (filters?.endDate) params["filter[endDate]"] = filters.endDate;
		if (filters?.date) params["filter[date]"] = filters.date;
		if (filters?.page) params.page = filters.page;
		if (filters?.perPage) params.perPage = filters.perPage;

		const response = await api.get(`${BASE_URL}/all`, { params });
		return response.data.data;
	},

	update: async (id: number, payload: UpdateAttendancePayload): Promise<Attendance> => {
		const response = await api.put(`${BASE_URL}/${id}`, payload);
		return response.data.data;
	},
};
