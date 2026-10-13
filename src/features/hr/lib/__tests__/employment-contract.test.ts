import { describe, expect, it } from "vitest";
import { buildEmploymentContractPayload, deriveContractEndDate, employmentContractSchema, getDefaultEmploymentContractFormValues } from "../employment-contract";
import type { EmploymentContractFormValues } from "../../types/employment-contract";

const formValues: EmploymentContractFormValues = {
	employmentType: "full_time",
	baseSalary: 12000,
	startDate: "2026-01-31",
	durationMonths: 1,
	workDays: ["sunday", "monday", "tuesday", "wednesday", "thursday"],
	workHoursPerDay: 8,
	workStartTime: "09:00",
	status: "active",
	terminatedOn: "",
	notes: "  Initial annual agreement  ",
};

describe("employment contract helpers", () => {
	it("builds the camelCase API payload and clears empty notes", () => {
		expect(buildEmploymentContractPayload(formValues)).toEqual({
			employmentType: "full_time",
			baseSalary: 12000,
			requiredMonthlyHours: null,
			startDate: "2026-01-31",
			durationMonths: 1,
			workDays: ["sunday", "monday", "tuesday", "wednesday", "thursday"],
			workHoursPerDay: 8,
			workStartTime: "09:00",
			status: "active",
			notes: "Initial annual agreement",
		});

		expect(buildEmploymentContractPayload({ ...formValues, notes: " " })).toHaveProperty("notes", null);
	});

	it("previews an inclusive end date while handling shorter months", () => {
		expect(deriveContractEndDate("2026-01-31", 1)).toBe("2026-02-27");
		expect(deriveContractEndDate("2026-01-01", 12)).toBe("2026-12-31");
		expect(deriveContractEndDate("2026-02-30", 1)).toBeNull();
	});

	it("defaults to the standard Sunday through Thursday, 09:00, eight-hour schedule", () => {
		const defaults = getDefaultEmploymentContractFormValues(new Date("2026-01-01T12:00:00"));

		expect(defaults.workDays).toEqual(["sunday", "monday", "tuesday", "wednesday", "thursday"]);
		expect(defaults.workStartTime).toBe("09:00");
		expect(defaults.workHoursPerDay).toBe(8);
	});

	it("rejects invalid schedules and contract limits before submitting", () => {
		const result = employmentContractSchema.safeParse({
			...formValues,
			startDate: "2026-02-30",
			durationMonths: 121,
			workDays: [],
			workHoursPerDay: 0,
			workStartTime: "25:00",
		});

		expect(result.success).toBe(false);
	});

	it("requires a valid termination date on or after the contract start date", () => {
		expect(employmentContractSchema.safeParse({ ...formValues, status: "terminated", terminatedOn: "" }).success).toBe(false);
		expect(employmentContractSchema.safeParse({ ...formValues, status: "terminated", terminatedOn: "2025-12-31" }).success).toBe(false);
		expect(employmentContractSchema.safeParse({ ...formValues, status: "terminated", terminatedOn: "2026-02-30" }).success).toBe(false);
		expect(employmentContractSchema.safeParse({ ...formValues, status: "terminated", terminatedOn: "2026-01-31" }).success).toBe(true);

		expect(buildEmploymentContractPayload({ ...formValues, status: "terminated", terminatedOn: "2026-02-15" })).toMatchObject({
			status: "terminated",
			terminatedOn: "2026-02-15",
		});
	});
});
