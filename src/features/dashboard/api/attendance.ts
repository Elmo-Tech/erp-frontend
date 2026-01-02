/**
 * Attendance API
 * API functions for smart attendance tracking
 *
 * Requirements: 14.1, 14.5
 */

import api from "@/lib/axios";
import { TodayAttendance, Attendance, TodayAttendanceResponse, ClockOutResponse } from "../types/attendance";

/**
 * Attendance history response type
 */
interface AttendanceHistoryApiResponse {
	success: boolean;
	data: {
		records: Array<{
			attendanceId: number;
			date: string;
			clockIn: string | null;
			clockOut: string | null;
			workedDuration: string;
			idleDuration: string;
			lateMinutes: number;
		}>;
		pagination: {
			total: number;
			currentPage: number;
			perPage: number;
			totalPages: number;
		};
	};
}

/**
 * API functions for attendance operations
 */
export const attendanceApi = {
	/**
	 * Get today's attendance record with context
	 * Requirement 14.1: GET /api/v1/attendance/today endpoint to get current day attendance
	 */
	getTodayAttendance: async (): Promise<TodayAttendance> => {
		const response = await api.get<TodayAttendanceResponse>("/attendance/today");
		return response.data.data;
	},

	/**
	 * Clock out and calculate idle time
	 * Requirement 14.5: POST /api/v1/attendance/clock-out endpoint to end workday
	 */
	clockOut: async (): Promise<Attendance> => {
		const response = await api.post<ClockOutResponse>("/attendance/clock-out");
		return response.data.data;
	},

	/**
	 * Get attendance history
	 * Requirement 14.1: GET /api/v1/attendance/history endpoint to get attendance records
	 */
	getAttendanceHistory: async (page: number = 1, perPage: number = 10) => {
		const response = await api.get<AttendanceHistoryApiResponse>("/attendance/history", {
			params: { page, perPage },
		});
		return response.data.data;
	},
};
