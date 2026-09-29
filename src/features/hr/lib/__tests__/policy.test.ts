import { describe, expect, it } from "vitest";
import { buildCreateHrPolicyPayload, normalizeHrPolicySettings, toHrPolicyFormValues } from "../policy";
import type { HrPolicy, HrPolicySettings } from "../../types";

const defaultSettings: HrPolicySettings = {
	workingDays: ["sunday", "monday", "tuesday", "wednesday", "thursday"],
	workStartTime: "09:00",
	workEndTime: "17:00",
	dailyRateDivisor: 30,
	unpaidLeaveDailyRateMultiplier: 1,
	annualLeaveDays: 21,
	sickLeaveDays: 10,
	emergencyLeaveDays: 6,
	leaveWorkflow: "employee_request_admin_approval",
	monthlyPaidPermissionHours: 6,
	permissionOverageBehavior: "admin_decides",
	lateDeductionReset: "monthly",
	lateDeductionTiers: [
		{ minimumMinutes: 15, maximumMinutes: 29, percentages: [0, 20, 30, 50] },
		{ minimumMinutes: 30, maximumMinutes: 44, percentages: [10, 20, 30, 50] },
		{ minimumMinutes: 45, maximumMinutes: 59, percentages: [20, 30, 40, 50] },
		{ minimumMinutes: 60, maximumMinutes: null, percentages: [30, 40, 50, 60] },
	],
	overtimeRequiresPreapproval: true,
	overtimeMultiplier: 1.5,
	advanceLimitSalaryPercentage: 100,
	advanceSettlement: "next_payroll",
	allowAdvanceInstallments: true,
	payrollPaymentDay: 1,
	midMonthHirePaidDays: 15,
	taskSupervisorLimit: 1,
};

const defaultPolicy: HrPolicy = {
	policyId: 1,
	settings: defaultSettings,
	effectiveFrom: "2026-01-01",
	createdBy: { userId: 1 },
	createdAt: "2026-01-01T00:00:00.000000Z",
	notes: "Initial policy",
};

describe("HR policy helpers", () => {
	it("normalizes loaded default policy data without inventing settings values", () => {
		const formValues = toHrPolicyFormValues(defaultPolicy);
		const normalizedSettings = normalizeHrPolicySettings(defaultSettings);

		expect(formValues).toEqual({ settings: defaultSettings, effectiveFrom: "", notes: "" });
		expect(normalizedSettings).toEqual(defaultSettings);

		normalizedSettings.workingDays.push("saturday");
		normalizedSettings.lateDeductionTiers[0].percentages[0] = 99;
		expect(defaultSettings.workingDays).not.toContain("saturday");
		expect(defaultSettings.lateDeductionTiers[0].percentages[0]).toBe(0);
	});

	it("builds a complete POST snapshot and omits empty version metadata", () => {
		expect(buildCreateHrPolicyPayload({ settings: defaultSettings, effectiveFrom: " ", notes: "" })).toEqual({
			settings: defaultSettings,
		});

		expect(buildCreateHrPolicyPayload({
			settings: defaultSettings,
			effectiveFrom: "2026-02-01",
			notes: "Updated leave allocation",
		})).toEqual({
			settings: defaultSettings,
			effectiveFrom: "2026-02-01",
			notes: "Updated leave allocation",
		});
	});

	it("keeps the task supervisor limit at the backend's single-supervisor value", () => {
		const settings = { ...defaultSettings, taskSupervisorLimit: 3 };

		expect(toHrPolicyFormValues({ ...defaultPolicy, settings }).settings.taskSupervisorLimit).toBe(1);
		expect(buildCreateHrPolicyPayload({ settings, effectiveFrom: "", notes: "" }).settings.taskSupervisorLimit).toBe(1);
	});
});
