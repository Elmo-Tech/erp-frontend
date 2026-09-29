import { z } from "zod";
import type { CreateEmployeeOvertimeRequestPayload, EmployeeOvertimeRequestStatus, OvertimeRequestFormValues } from "../types/overtime-requests";

const overtimeDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const overtimeTimePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const overtimeStatusLabels: Record<EmployeeOvertimeRequestStatus, string> = {
	pending: "Pending",
	approved: "Approved",
	rejected: "Rejected",
	cancelled: "Cancelled",
};

export const overtimeRequestSchema = z
	.object({
		overtimeDate: z.string().refine(isFutureOvertimeDate, "Overtime date must be in the future"),
		startTime: z.string().refine(isValidOvertimeTime, "Enter a valid start time"),
		endTime: z.string().refine(isValidOvertimeTime, "Enter a valid end time"),
		reason: z.string().trim().min(1, "Reason is required").max(2000, "Reason cannot exceed 2,000 characters"),
	})
	.superRefine((values, context) => {
		if (isValidOvertimeTime(values.startTime) && isValidOvertimeTime(values.endTime) && !isOvertimeTimeRangeValid(values.startTime, values.endTime)) {
			context.addIssue({
				code: "custom",
				path: ["endTime"],
				message: "End time must be later than start time",
			});
		}
	});

export function isValidOvertimeDate(value: string): boolean {
	if (!overtimeDatePattern.test(value)) return false;

	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));

	return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isFutureOvertimeDate(value: string, today = new Date()): boolean {
	if (!isValidOvertimeDate(value)) return false;
	return value > formatLocalDate(today);
}

export function isValidOvertimeTime(value: string): boolean {
	return overtimeTimePattern.test(value);
}

export function calculateOvertimeDurationMinutes(startTime: string, endTime: string): number | null {
	if (!isValidOvertimeTime(startTime) || !isValidOvertimeTime(endTime)) return null;

	const [startHour, startMinute] = startTime.split(":").map(Number);
	const [endHour, endMinute] = endTime.split(":").map(Number);
	const durationMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);

	return durationMinutes > 0 ? durationMinutes : null;
}

export function isOvertimeTimeRangeValid(startTime: string, endTime: string): boolean {
	return calculateOvertimeDurationMinutes(startTime, endTime) !== null;
}

export function isValidOvertimePeriod(year: number, month: number): boolean {
	return Number.isInteger(year) && year >= 1 && Number.isInteger(month) && month >= 1 && month <= 12;
}

export function formatOvertimeMinutes(minutes: number | null | undefined): string {
	if (minutes === null || minutes === undefined || !Number.isFinite(minutes)) return "Not recorded";

	const roundedMinutes = Math.max(0, Math.round(minutes));
	const hours = Math.floor(roundedMinutes / 60);
	const remainingMinutes = roundedMinutes % 60;

	if (hours === 0) return `${remainingMinutes}m`;
	if (remainingMinutes === 0) return `${hours}h`;
	return `${hours}h ${remainingMinutes}m`;
}

export function formatOvertimeCurrency(amount: number | null | undefined, currency?: string): string {
	if (amount === null || amount === undefined || !Number.isFinite(amount)) return "Not calculated";

	if (currency) {
		return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
	}

	return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export function getOvertimeStatusLabel(status: EmployeeOvertimeRequestStatus): string {
	return overtimeStatusLabels[status];
}

export function getCurrentOvertimePeriod(today = new Date()): { year: number; month: number } {
	return { year: today.getFullYear(), month: today.getMonth() + 1 };
}

export function getDefaultOvertimeRequestFormValues(today = new Date()): OvertimeRequestFormValues {
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	return {
		overtimeDate: formatLocalDate(tomorrow),
		startTime: "",
		endTime: "",
		reason: "",
	};
}

export function buildEmployeeOvertimeRequestPayload(values: OvertimeRequestFormValues): CreateEmployeeOvertimeRequestPayload {
	return {
		overtimeDate: values.overtimeDate,
		startTime: values.startTime,
		endTime: values.endTime,
		reason: values.reason.trim(),
	};
}

function formatLocalDate(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
