import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { HrPoliciesSettings } from "./HrPoliciesSettings";
import type { HrPolicy } from "../types";

const { save } = vi.hoisted(() => ({ save: vi.fn() }));
const policy: HrPolicy = {
	policyId: 1, createdAt: "2026-10-01", effectiveFrom: "2026-10-01", createdBy: null, notes: null,
	settings: {
		workingDays: ["sunday", "monday", "tuesday", "wednesday", "thursday"], workStartTime: "09:00", workEndTime: "17:00",
		dailyRateDivisor: 30, unpaidLeaveDailyRateMultiplier: 1, annualLeaveDays: 21, sickLeaveDays: 10, emergencyLeaveDays: 6,
		leaveWorkflow: "both", monthlyPaidPermissionHours: 6, permissionOverageBehavior: "admin_decides", lateDeductionReset: "monthly",
		lateDeductionTiers: [
			{ minimumMinutes: 15, maximumMinutes: 29, percentages: [0, 20, 30, 50] },
			{ minimumMinutes: 30, maximumMinutes: 44, percentages: [10, 20, 30, 50] },
			{ minimumMinutes: 45, maximumMinutes: 59, percentages: [20, 30, 40, 50] },
			{ minimumMinutes: 60, maximumMinutes: null, percentages: [30, 40, 50, 60] },
		],
		overtimeRequiresPreapproval: true, overtimeMultiplier: 1.5, advanceLimitSalaryPercentage: 100,
		advanceSettlement: "next_payroll", allowAdvanceInstallments: true, payrollPaymentDay: 1, midMonthHirePaidDays: 15, taskSupervisorLimit: 1,
	},
};
vi.mock("../hooks/useHrPolicies", () => ({
	useCurrentHrPolicy: () => ({ data: policy, isLoading: false }),
	useCreateHrPolicy: () => ({ mutateAsync: save, isPending: false }),
}));

it("saves the open-ended late range and edited fourth-plus percentage without requiring an upper limit", async () => {
	save.mockResolvedValue(policy);
	render(<HrPoliciesSettings />);
	fireEvent.change(screen.getAllByLabelText("Through (minutes)")[3], { target: { value: "" } });
	fireEvent.change(screen.getAllByLabelText("Fourth+ (%)")[3], { target: { value: "65" } });
	fireEvent.click(screen.getByRole("button", { name: "Save new policy version" }));
	await waitFor(() => expect(save).toHaveBeenCalledOnce());
	expect(save.mock.calls[0][0].settings.lateDeductionTiers[3]).toEqual({ minimumMinutes: 60, maximumMinutes: null, percentages: [30, 40, 50, 65] });
	expect(save.mock.calls[0][0].settings.advanceSettlement).toBe("next_payroll");
});
