import { z } from "zod";
import type { CreateEmployeeLeavePayload, CreateLeaveTypePayload, LeaveRequestFormValues, LeaveType, LeaveTypeFormValues } from "../types/leave-management";

const leaveDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const leaveTypeSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const leaveTypeFormSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	slug: z.string().trim().regex(leaveTypeSlugPattern, "Use lowercase letters, numbers, and hyphens only"),
	annualAllowanceDays: z.number().int("Annual allowance must be a whole number").min(0, "Annual allowance must be at least 0").max(366, "Annual allowance cannot exceed 366"),
	isPaid: z.boolean(),
	isActive: z.boolean(),
	displayOrder: z.number().int("Display order must be a whole number").min(0, "Display order must be at least 0").max(65535, "Display order cannot exceed 65,535"),
});

export const leaveRequestSchema = z
	.object({
		leaveTypeId: z.string().refine((value) => Number.isSafeInteger(Number(value)) && Number(value) > 0, "Select a leave type"),
		startDate: z.string().refine(isValidLeaveDate, "Enter a valid start date"),
		endDate: z.string().refine(isValidLeaveDate, "Enter a valid end date"),
		reason: z.string().max(2000, "Reason cannot exceed 2,000 characters"),
	})
	.superRefine((values, context) => {
		if (isValidLeaveDate(values.startDate) && isValidLeaveDate(values.endDate) && !isLeaveDateRangeValid(values.startDate, values.endDate)) {
			context.addIssue({
				code: "custom",
				path: ["endDate"],
				message: "End date must be on or after the start date",
			});
		}
	});

export function isValidLeaveDate(value: string): boolean {
	if (!leaveDatePattern.test(value)) return false;

	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));

	return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isLeaveDateRangeValid(startDate: string, endDate: string): boolean {
	return isValidLeaveDate(startDate) && isValidLeaveDate(endDate) && startDate <= endDate;
}

export function getDefaultLeaveRequestFormValues(today = new Date()): LeaveRequestFormValues {
	const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

	return {
		leaveTypeId: "",
		startDate: localToday,
		endDate: localToday,
		reason: "",
	};
}

export function buildEmployeeLeavePayload(values: LeaveRequestFormValues): CreateEmployeeLeavePayload {
	const reason = values.reason.trim();
	const payload: CreateEmployeeLeavePayload = {
		leaveTypeId: Number(values.leaveTypeId),
		startDate: values.startDate,
		endDate: values.endDate,
	};

	if (reason) payload.reason = reason;
	return payload;
}

export function toLeaveTypeFormValues(leaveType?: LeaveType): LeaveTypeFormValues {
	return leaveType
		? {
			name: leaveType.name,
			slug: leaveType.slug,
			annualAllowanceDays: leaveType.annualAllowanceDays,
			isPaid: leaveType.isPaid,
			isActive: leaveType.isActive,
			displayOrder: leaveType.displayOrder,
		}
		: {
			name: "",
			slug: "",
			annualAllowanceDays: 0,
			isPaid: true,
			isActive: true,
			displayOrder: 0,
		};
}

export function buildLeaveTypePayload(values: LeaveTypeFormValues): CreateLeaveTypePayload {
	return {
		...values,
		name: values.name.trim(),
		slug: values.slug.trim(),
	};
}
