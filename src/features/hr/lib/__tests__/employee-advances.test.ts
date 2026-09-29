import { describe, expect, it } from "vitest";
import { buildEmployeeAdvancePayload, employeeAdvanceFormSchema, formatEmployeeAdvanceAmount, getCurrentEmployeeAdvancePeriod, getDefaultEmployeeAdvanceFormValues, isScheduledEmployeeAdvanceSettlement, isValidEmployeeAdvanceAmount, isValidEmployeeAdvancePeriod } from "../employee-advances";
import type { EmployeeAdvanceFormValues, EmployeeAdvanceSettlement } from "../../types/employee-advances";

const request: EmployeeAdvanceFormValues = {
	requestedAmount: 1250.5,
	reason: "  Emergency medical expense  ",
	installmentCount: 3,
};

describe("employee advance helpers", () => {
	it("validates an amount, installment count, reason, and reporting period", () => {
		expect(employeeAdvanceFormSchema.safeParse(request).success).toBe(true);
		expect(employeeAdvanceFormSchema.safeParse({ ...request, requestedAmount: 10.123, installmentCount: 13, reason: " " }).success).toBe(false);
		expect(isValidEmployeeAdvanceAmount(10.5)).toBe(true);
		expect(isValidEmployeeAdvanceAmount(0)).toBe(false);
		expect(isValidEmployeeAdvancePeriod(2026, 5)).toBe(true);
		expect(isValidEmployeeAdvancePeriod(2026, 13)).toBe(false);
	});

	it("builds a normalized request and identifies only scheduled recoveries as settleable", () => {
		const settlement: EmployeeAdvanceSettlement = { id: 2, sequence: 1, dueOn: "2026-06-01", scheduledAmount: 416.83, status: "scheduled" };

		expect(buildEmployeeAdvancePayload(request)).toEqual({ requestedAmount: 1250.5, reason: "Emergency medical expense", installmentCount: 3 });
		expect(getDefaultEmployeeAdvanceFormValues()).toEqual({ requestedAmount: "", reason: "", installmentCount: 1 });
		expect(getCurrentEmployeeAdvancePeriod(new Date("2026-05-04T12:00:00"))).toEqual({ year: 2026, month: 5 });
		expect(formatEmployeeAdvanceAmount(1250.5)).toBe("1,250.50");
		expect(isScheduledEmployeeAdvanceSettlement(settlement)).toBe(true);
		expect(isScheduledEmployeeAdvanceSettlement({ ...settlement, status: "settled" })).toBe(false);
	});
});
