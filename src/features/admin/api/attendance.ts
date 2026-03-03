import api from "@/lib/axios";
import { Attendance, AttendanceFilters, AttendanceFormData, PaginatedResponse, EmployeeDeduction } from "../types/attendance";

export const attendanceApi = {
	getAll: async (filters?: AttendanceFilters, page = 1, perPage = 15): Promise<PaginatedResponse<Attendance>> => {
		const params = new URLSearchParams();
		params.append("page", String(page));
		params.append("perPage", String(perPage));

		if (filters?.userId) params.append("filter.userId", String(filters.userId));
		if (filters?.startDate) params.append("filter.startDate", filters.startDate);
		if (filters?.endDate) params.append("filter.endDate", filters.endDate);
		if (filters?.date) params.append("filter.date", filters.date);

		console.log('[Attendance API] Fetching with filters:', Object.fromEntries(params));
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

	// Add deduction to an attendance record
	addDeduction: async (
		id: number,
		data: {
			deduction_type_id: number;
			amount: number;
			reason?: string;
			late_minutes?: number;
		}
	): Promise<EmployeeDeduction> => {
		const response = await api.post(`/attendance/${id}/deduction`, data);
		return response.data.data;
	},

	// Mark attendance as grace day
	markGraceDay: async (id: number): Promise<Attendance> => {
		const response = await api.post(`/attendance/${id}/grace-day`);
		return response.data.data;
	},

	// Remove grace day from attendance
	removeGraceDay: async (id: number): Promise<Attendance> => {
		const response = await api.delete(`/attendance/${id}/grace-day`);
		return response.data.data;
	},
};
