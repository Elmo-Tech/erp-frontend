import { z } from "zod";
import type { LateDeductionOverrideFormValues, OverrideLateDeductionPayload } from "../types/late-deductions";

export const lateDeductionOverrideSchema = z.object({
	amount: z
		.union([z.number().finite("Enter a valid amount"), z.literal("")])
		.refine((value) => typeof value === "number" && value >= 0, "Amount must be zero or greater")
		.refine((value) => typeof value === "number" && hasAtMostTwoDecimalPlaces(value), "Amount can have at most 2 decimal places"),
	reason: z.string().trim().min(1, "Reason is required").max(2000, "Reason cannot exceed 2,000 characters"),
});

export function isValidLateDeductionPeriod(year: number, month: number): boolean {
	return Number.isInteger(year) && year >= 1000 && year <= 9999 && Number.isInteger(month) && month >= 1 && month <= 12;
}

export function toLateDeductionMonth(month: number): string {
	return String(month).padStart(2, "0");
}

export function formatLateDeductionOccurrence(occurrenceNumber: number | null): string {
	if (occurrenceNumber === null) return "Not applicable";
	return occurrenceNumber >= 4 ? "4+" : String(occurrenceNumber);
}

export function buildLateDeductionOverridePayload(values: LateDeductionOverrideFormValues): OverrideLateDeductionPayload {
	const parsed = lateDeductionOverrideSchema.parse(values);

	return {
		amount: Number(parsed.amount),
		reason: parsed.reason,
	};
}

function hasAtMostTwoDecimalPlaces(value: number): boolean {
	return Math.abs(value * 100 - Math.round(value * 100)) < Number.EPSILON * 100;
}
