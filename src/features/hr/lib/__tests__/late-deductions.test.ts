import { describe, expect, it } from "vitest";
import { buildLateDeductionOverridePayload, formatLateDeductionOccurrence, isValidLateDeductionPeriod, lateDeductionOverrideSchema } from "../late-deductions";
import type { LateDeductionOverrideFormValues } from "../../types/late-deductions";

const override: LateDeductionOverrideFormValues = {
	amount: 125.5,
	reason: "  Corrected after review  ",
};

describe("late deduction helpers", () => {
	it("validates reporting periods", () => {
		expect(isValidLateDeductionPeriod(2026, 5)).toBe(true);
		expect(isValidLateDeductionPeriod(2026, 13)).toBe(false);
	});

	it("labels the capped fourth monthly occurrence as 4+", () => {
		expect(formatLateDeductionOccurrence(null)).toBe("Not applicable");
		expect(formatLateDeductionOccurrence(3)).toBe("3");
		expect(formatLateDeductionOccurrence(4)).toBe("4+");
		expect(formatLateDeductionOccurrence(8)).toBe("4+");
	});

	it("requires a reason and a non-negative amount with no more than two decimals", () => {
		expect(lateDeductionOverrideSchema.safeParse(override).success).toBe(true);
		expect(lateDeductionOverrideSchema.safeParse({ amount: 0, reason: "Cancel pending adjustment" }).success).toBe(true);
		expect(lateDeductionOverrideSchema.safeParse({ amount: -1, reason: "Correction" }).success).toBe(false);
		expect(lateDeductionOverrideSchema.safeParse({ amount: 1.234, reason: "Correction" }).success).toBe(false);
		expect(lateDeductionOverrideSchema.safeParse({ amount: 10, reason: " " }).success).toBe(false);
	});

	it("builds a trimmed override payload", () => {
		expect(buildLateDeductionOverridePayload(override)).toEqual({
			amount: 125.5,
			reason: "Corrected after review",
		});
	});
});
