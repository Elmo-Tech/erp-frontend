import api from "@/lib/axios";
import { Attendance, AttendanceFilters, AttendanceFormData, PaginatedResponse } from "../types/attendance";

export const attendanceApi = {
	getAll: async (filters?: AttendanceFilters, page = 1, perPage = 15): Promise<PaginatedResponse<Attendance>> => {
		const params = new URLSearchParams();
		params.append("page", String(page));
		params.append("perPage", String(perPage));

		if (filters?.userId) params.append("filter.userId", String(filters.userId));
		if (filters?.startDate) params.append("filter.startDate", filters.startDate);
		if (filters?.endDate) params.append("filter.endDate", filters.endDate);
		if (filters?.date) params.append("filter.date", filters.date);

		const response = await api.get(`/attendance/all?${params.toString()}`);
		return response.data.data;
	},

	create: async (data: AttendanceFormData): Promise<Attendance> => {
		const response = await api.post("/attendance", data);
		return response.data.data;
	},

	update: async (id: number, data: Partial<AttendanceFormData>): Promise<Attendance> => {
		const response = await api.put(`/attendance/${id}`, data);
		return response.data.data;
	},
};
