import { describe, expect, it } from "vitest";
import { buildDirectEmployeeDeductionPayload, directEmployeeDeductionFormSchema, getDefaultDirectEmployeeDeductionFormValues, isValidDirectDeductionDate, isValidDirectDeductionPeriod } from "../direct-employee-deductions";
import type { DirectEmployeeDeductionFormValues } from "../../types/direct-employee-deductions";

const request: DirectEmployeeDeductionFormValues = {
	deductionTypeId: "4",
	deductionDate: "2026-02-27",
	amount: 125.5,
	reason: "  Unreturned equipment  ",
};

describe("direct employee deduction helpers", () => {
	it("accepts real calendar dates and valid reporting periods", () => {
		expect(isValidDirectDeductionDate("2028-02-29")).toBe(true);
		expect(isValidDirectDeductionDate("2026-02-29")).toBe(false);
		expect(isValidDirectDeductionPeriod(2026, 5)).toBe(true);
		expect(isValidDirectDeductionPeriod(2026, 13)).toBe(false);
	});

	it("requires a type, date, positive two-decimal amount, and reason", () => {
		expect(directEmployeeDeductionFormSchema.safeParse(request).success).toBe(true);
		expect(
			directEmployeeDeductionFormSchema.safeParse({
				...request,
				deductionTypeId: "",
				deductionDate: "2026-02-30",
				amount: 10.123,
				reason: " ",
			}).success,
		).toBe(false);
	});

	it("builds a trimmed API payload and defaults the date locally", () => {
		expect(buildDirectEmployeeDeductionPayload(request)).toEqual({
			deductionTypeId: 4,
			deductionDate: "2026-02-27",
			amount: 125.5,
			reason: "Unreturned equipment",
		});
		expect(getDefaultDirectEmployeeDeductionFormValues(new Date("2026-04-10T12:00:00"))).toMatchObject({
			deductionTypeId: "",
			deductionDate: "2026-04-10",
			amount: "",
		});
	});
});
