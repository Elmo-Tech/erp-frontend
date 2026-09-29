import { z } from "zod";
import type { CreateEmployeeShortPermissionPayload, ShortPermissionRequestFormValues } from "../types/short-permissions";

const permissionDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const permissionMonthPattern = /^\d{4}-\d{2}$/;
const permissionTimePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const shortPermissionRequestSchema = z
	.object({
		permissionDate: z.string().refine(isValidPermissionDate, "Enter a valid permission date"),
		startTime: z.string().refine(isValidPermissionTime, "Enter a valid start time"),
		endTime: z.string().refine(isValidPermissionTime, "Enter a valid end time"),
		reason: z.string().max(2000, "Reason cannot exceed 2,000 characters"),
	})
	.superRefine((values, context) => {
		if (isValidPermissionTime(values.startTime) && isValidPermissionTime(values.endTime) && !isPermissionTimeRangeValid(values.startTime, values.endTime)) {
			context.addIssue({
				code: "custom",
				path: ["endTime"],
				message: "End time must be later than start time",
			});
		}
	});

export function isValidPermissionDate(value: string): boolean {
	if (!permissionDatePattern.test(value)) return false;

	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));

	return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isValidPermissionMonth(value: string): boolean {
	if (!permissionMonthPattern.test(value)) return false;

	const [, month] = value.split("-").map(Number);
	return month >= 1 && month <= 12;
}

export function isValidPermissionTime(value: string): boolean {
	return permissionTimePattern.test(value);
}

export function calculatePermissionDurationMinutes(startTime: string, endTime: string): number | null {
	if (!isValidPermissionTime(startTime) || !isValidPermissionTime(endTime)) return null;

	const [startHour, startMinute] = startTime.split(":").map(Number);
	const [endHour, endMinute] = endTime.split(":").map(Number);
	const durationMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);

	return durationMinutes > 0 ? durationMinutes : null;
}

export function isPermissionTimeRangeValid(startTime: string, endTime: string): boolean {
	return calculatePermissionDurationMinutes(startTime, endTime) !== null;
}

export function formatPermissionDuration(minutes: number): string {
	const roundedMinutes = Number.isFinite(minutes) ? Math.max(0, Math.round(minutes)) : 0;
	const hours = Math.floor(roundedMinutes / 60);
	const remainingMinutes = roundedMinutes % 60;

	if (hours === 0) return `${remainingMinutes}m`;
	if (remainingMinutes === 0) return `${hours}h`;
	return `${hours}h ${remainingMinutes}m`;
}

export function getCurrentPermissionMonth(today = new Date()): string {
	return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

export function getDefaultShortPermissionRequestFormValues(today = new Date()): ShortPermissionRequestFormValues {
	const permissionDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

	return {
		permissionDate,
		startTime: "09:00",
		endTime: "10:00",
		reason: "",
	};
}

export function buildEmployeeShortPermissionPayload(values: ShortPermissionRequestFormValues): CreateEmployeeShortPermissionPayload {
	const reason = values.reason.trim();
	const payload: CreateEmployeeShortPermissionPayload = {
		permissionDate: values.permissionDate,
		startTime: values.startTime,
		endTime: values.endTime,
	};

	if (reason) payload.reason = reason;
	return payload;
}
