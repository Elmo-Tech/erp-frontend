import { z } from "zod";
import type { CreateDirectEmployeeDeductionPayload, DirectEmployeeDeductionFormValues } from "../types/direct-employee-deductions";

const deductionDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export const directEmployeeDeductionFormSchema = z.object({
	deductionTypeId: z.string().refine((value) => Number.isSafeInteger(Number(value)) && Number(value) > 0, "Select a deduction type"),
	deductionDate: z.string().refine(isValidDirectDeductionDate, "Enter a valid deduction date"),
	amount: z
		.union([z.number().finite("Enter a valid amount"), z.literal("")])
		.refine((value) => typeof value === "number" && value > 0, "Amount must be greater than 0")
		.refine((value) => typeof value === "number" && hasAtMostTwoDecimalPlaces(value), "Amount can have at most 2 decimal places"),
	reason: z.string().trim().min(1, "Reason is required").max(2000, "Reason cannot exceed 2,000 characters"),
});

export function isValidDirectDeductionDate(value: string): boolean {
	if (!deductionDatePattern.test(value)) return false;

	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));

	return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isValidDirectDeductionPeriod(year: number, month: number): boolean {
	return Number.isInteger(year) && year >= 1000 && year <= 9999 && Number.isInteger(month) && month >= 1 && month <= 12;
}

export function getDefaultDirectEmployeeDeductionFormValues(today = new Date()): DirectEmployeeDeductionFormValues {
	return {
		deductionTypeId: "",
		deductionDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
		amount: "",
		reason: "",
	};
}

export function buildDirectEmployeeDeductionPayload(values: DirectEmployeeDeductionFormValues): CreateDirectEmployeeDeductionPayload {
	return {
		deductionTypeId: Number(values.deductionTypeId),
		deductionDate: values.deductionDate,
		amount: Number(values.amount),
		reason: values.reason.trim(),
	};
}

function hasAtMostTwoDecimalPlaces(value: number): boolean {
	return Math.abs(value * 100 - Math.round(value * 100)) < Number.EPSILON * 100;
}
