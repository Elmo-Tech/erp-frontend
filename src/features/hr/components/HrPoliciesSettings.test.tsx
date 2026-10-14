import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
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
let currentPolicy = policy;
let isPending = false;
vi.mock("../hooks/useHrPolicies", () => ({
	useCurrentHrPolicy: () => ({ data: currentPolicy, isLoading: false }),
	useCreateHrPolicy: () => ({ mutateAsync: save, isPending }),
}));

beforeEach(() => {
	currentPolicy = policy;
	isPending = false;
	save.mockReset().mockImplementation(async (payload) => ({ ...policy, policyId: 2, settings: payload.settings }));
});

it("saves the open-ended late range and edited fourth-plus percentage without requiring an upper limit", async () => {
	render(<HrPoliciesSettings />);
	fireEvent.change(screen.getAllByLabelText("Through (minutes)")[3], { target: { value: "" } });
	fireEvent.change(screen.getAllByLabelText("Fourth+ (%)")[3], { target: { value: "65" } });
	fireEvent.click(screen.getByRole("button", { name: "Save settings" }));
	await waitFor(() => expect(save).toHaveBeenCalledOnce());
	expect(save.mock.calls[0][0].settings.lateDeductionTiers[3]).toEqual({ minimumMinutes: 60, maximumMinutes: null, percentages: [30, 40, 50, 65] });
	expect(save.mock.calls[0][0].settings.advanceSettlement).toBe("next_payroll");
});

it("adds an editable fifth range, splits the open-ended range, and saves both without losing other settings", async () => {
	render(<HrPoliciesSettings />);
	fireEvent.change(screen.getAllByLabelText("Fourth+ (%)")[3], { target: { value: "65" } });
	fireEvent.click(screen.getByRole("button", { name: "Add range" }));
	await waitFor(() => expect(screen.getAllByLabelText("From (minutes)")).toHaveLength(5));
	expect(screen.getAllByLabelText("Through (minutes)")[3]).toHaveValue(74);
	expect(screen.getAllByLabelText("From (minutes)")[4]).toHaveValue(75);
	expect(screen.getAllByLabelText("Fourth+ (%)")[4]).toHaveValue(65);
	fireEvent.change(screen.getAllByLabelText("First (%)")[4], { target: { value: "40" } });
	fireEvent.click(screen.getByRole("button", { name: "Save settings" }));
	await waitFor(() => expect(save).toHaveBeenCalledOnce());
	expect(save.mock.calls[0][0].settings).toEqual({
		...policy.settings,
		lateDeductionTiers: [
			...policy.settings.lateDeductionTiers.slice(0, 3),
			{ minimumMinutes: 60, maximumMinutes: 74, percentages: [30, 40, 50, 65] },
			{ minimumMinutes: 75, maximumMinutes: null, percentages: [40, 40, 50, 65] },
		],
	});
	await waitFor(() => expect(screen.getAllByLabelText("From (minutes)")).toHaveLength(5));
});

it("removes a middle range, covers its minutes, and preserves edits on the remaining ranges in the saved policy", async () => {
	render(<HrPoliciesSettings />);
	fireEvent.change(screen.getAllByLabelText("Fourth+ (%)")[2], { target: { value: "55" } });
	fireEvent.click(screen.getByRole("button", { name: "Remove late range 2" }));
	expect(screen.getAllByLabelText("From (minutes)")).toHaveLength(3);
	expect(screen.getAllByLabelText("Fourth+ (%)")[1]).toHaveValue(55);
	expect(screen.getAllByLabelText("Through (minutes)")[0]).toHaveValue(44);
	fireEvent.click(screen.getByRole("button", { name: "Save settings" }));
	await waitFor(() => expect(save).toHaveBeenCalledOnce());
	expect(save.mock.calls[0][0].settings.lateDeductionTiers).toEqual([
		{ minimumMinutes: 15, maximumMinutes: 44, percentages: [0, 20, 30, 50] },
		{ minimumMinutes: 45, maximumMinutes: 59, percentages: [20, 30, 40, 55] },
		policy.settings.lateDeductionTiers[3],
	]);
});

it.each([
	{ index: 0, remaining: [
		{ minimumMinutes: 15, maximumMinutes: 44, percentages: [10, 20, 30, 50] },
		...policy.settings.lateDeductionTiers.slice(2),
	] },
	{ index: 3, remaining: [
		...policy.settings.lateDeductionTiers.slice(0, 2),
		{ minimumMinutes: 45, maximumMinutes: null, percentages: [20, 30, 40, 50] },
	] },
])("keeps all minutes covered when removing range $index at an edge", async ({ index, remaining }) => {
	render(<HrPoliciesSettings />);
	fireEvent.click(screen.getByRole("button", { name: `Remove late range ${index + 1}` }));
	fireEvent.click(screen.getByRole("button", { name: "Save settings" }));
	await waitFor(() => expect(save).toHaveBeenCalledOnce());
	expect(save.mock.calls[0][0].settings.lateDeductionTiers).toEqual(remaining);
});

it("loads a single range and prevents deleting the last one", () => {
	currentPolicy = { ...policy, settings: { ...policy.settings, lateDeductionTiers: [policy.settings.lateDeductionTiers[3]] } };
	render(<HrPoliciesSettings />);
	expect(screen.getAllByLabelText("From (minutes)")).toHaveLength(1);
	expect(screen.getByRole("button", { name: "Remove late range 1" })).toBeDisabled();
});

it("loads twenty ranges and prevents exceeding the backend limit", () => {
	currentPolicy = {
		...policy,
		settings: {
			...policy.settings,
			lateDeductionTiers: Array.from({ length: 20 }, (_, index) => ({
				minimumMinutes: index * 15,
				maximumMinutes: index === 19 ? null : index * 15 + 14,
				percentages: [0, 20, 30, 50],
			})),
		},
	};
	render(<HrPoliciesSettings />);
	expect(screen.getAllByLabelText("From (minutes)")).toHaveLength(20);
	expect(screen.getByRole("button", { name: "Add range" })).toBeDisabled();
});

it("appends after a bounded range without changing its upper limit", async () => {
	render(<HrPoliciesSettings />);
	fireEvent.change(screen.getAllByLabelText("Through (minutes)")[3], { target: { value: "90" } });
	fireEvent.click(screen.getByRole("button", { name: "Add range" }));
	await waitFor(() => expect(screen.getAllByLabelText("From (minutes)")).toHaveLength(5));
	expect(screen.getAllByLabelText("Through (minutes)")[3]).toHaveValue(90);
	expect(screen.getAllByLabelText("From (minutes)")[4]).toHaveValue(91);
});

it("prevents adding a range beyond the maximum supported late minutes", () => {
	currentPolicy = {
		...policy,
		settings: { ...policy.settings, lateDeductionTiers: [{ minimumMinutes: 1440, maximumMinutes: null, percentages: [30, 40, 50, 60] }] },
	};
	render(<HrPoliciesSettings />);
	expect(screen.getByRole("button", { name: "Add range" })).toBeDisabled();
});

it.each([
	{ label: "From (minutes)", index: 1, value: "29", error: "Range 2: Ranges must be ordered and must not overlap." },
	{ label: "Through (minutes)", index: 0, value: "", error: "Range 1: Only the last range can have no upper limit." },
	{ label: "Through (minutes)", index: 0, value: "14", error: "Range 1: Through must be a whole number from 15 to 1440, or blank for no upper limit." },
	{ label: "First (%)", index: 0, value: "", error: "Range 1: Each deduction percentage must be a whole number between 0 and 100." },
	{ label: "From (minutes)", index: 0, value: "", error: "Range 1: From must be a whole number between 0 and 1440 minutes." },
])("shows a validation error instead of saving an invalid range: $error", async ({ label, index, value, error }) => {
	render(<HrPoliciesSettings />);
	fireEvent.change(screen.getAllByLabelText(label)[index], { target: { value } });
	fireEvent.click(screen.getByRole("button", { name: "Save settings" }));
	expect(await screen.findByRole("alert")).toHaveTextContent(error);
	expect(save).not.toHaveBeenCalled();
});

it("disables range controls while saving", () => {
	isPending = true;
	render(<HrPoliciesSettings />);
	expect(screen.getByRole("button", { name: "Add range" })).toBeDisabled();
	for (const button of screen.getAllByRole("button", { name: /Remove late range/ })) {
		expect(button).toBeDisabled();
	}
});
