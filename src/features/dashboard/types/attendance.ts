/**
 * Attendance Types
 * Type definitions for smart attendance tracking
 *
 * Requirements: 14.1
 */

/**
 * Attendance record interface
 */
export interface Attendance {
	attendanceId: number;
	userId: number;
	date: string;
	clockIn: string;
	clockOut: string | null;
	lateMinutes: number;
	idleMinutes: number;
	createdAt: string;
	updatedAt: string;
}

/**
 * Today's attendance with additional context
 */
export interface TodayAttendance {
	attendance: Attendance | null;
	hasActiveTimer: boolean;
	totalWorkedMinutes: number;
	currentIdleMinutes?: number; // Only calculated if clocked out
}

/**
 * Clock out payload
 */
export interface ClockOutPayload {
	// No payload needed - uses current time
}

/**
 * Response structure for today's attendance endpoint
 * GET /api/v1/attendance/today
 */
export interface TodayAttendanceResponse {
	data: TodayAttendance;
}

/**
 * Response structure for clock out endpoint
 * POST /api/v1/attendance/clock-out
 */
export interface ClockOutResponse {
	data: Attendance;
}
