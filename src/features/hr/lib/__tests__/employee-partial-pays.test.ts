import { describe, expect, it } from "vitest";
import { buildEmployeePartialPayPayload, employeePartialPayFormSchema, formatEmployeePartialPayAmount, getCurrentEmployeePartialPayPeriod, getDefaultEmployeePartialPayFormValues, getEmployeePartialPayKindLabel, getEmployeePartialPayPolicySnapshotValue, isValidEmployeePartialPayPeriod } from "../employee-partial-pays";
import type { EmployeePartialPayFormValues } from "../../types/employee-partial-pays";

const values: EmployeePartialPayFormValues = {
	contractId: 8,
	kind: "first_month",
};

describe("employee partial-pay helpers", () => {
	it("validates the contract selection and builds the server-owned calculation payload", () => {
		expect(employeePartialPayFormSchema.safeParse(values).success).toBe(true);
		expect(employeePartialPayFormSchema.safeParse({ ...values, contractId: "" }).success).toBe(false);
		expect(buildEmployeePartialPayPayload(values, 2026, 5)).toEqual({ contractId: 8, kind: "first_month", payrollYear: 2026, payrollMonth: 5 });
	});

	it("validates periods and keeps all financial values display-only", () => {
		expect(isValidEmployeePartialPayPeriod(2026, 5)).toBe(true);
		expect(isValidEmployeePartialPayPeriod(2026, 13)).toBe(false);
		expect(getCurrentEmployeePartialPayPeriod(new Date("2026-05-04T12:00:00"))).toEqual({ year: 2026, month: 5 });
		expect(getDefaultEmployeePartialPayFormValues()).toEqual({ contractId: "", kind: "first_month" });
		expect(formatEmployeePartialPayAmount(1250.5)).toBe("1,250.50");
		expect(getEmployeePartialPayKindLabel("termination")).toBe("Termination pay");
	});

	it("reads retained policy values from either snapshot shape", () => {
		expect(getEmployeePartialPayPolicySnapshotValue({ midMonthHirePaidDays: 15 }, "midMonthHirePaidDays")).toBe(15);
		expect(getEmployeePartialPayPolicySnapshotValue({ settings: { dailyRateDivisor: 30 } }, "dailyRateDivisor")).toBe(30);
	});
});
