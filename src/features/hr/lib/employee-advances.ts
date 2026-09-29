import { z } from "zod";
import type { CreateEmployeeAdvancePayload, EmployeeAdvanceFormValues, EmployeeAdvanceSettlement, EmployeeAdvanceStatus } from "../types/employee-advances";

export const employeeAdvanceStatusLabels: Record<EmployeeAdvanceStatus, string> = {
	pending: "Pending",
	approved: "Approved",
	rejected: "Rejected",
	cancelled: "Cancelled",
	disbursed: "Disbursed",
	settled: "Settled",
};

export const employeeAdvanceFormSchema = z.object({
	requestedAmount: z
		.union([z.number().finite("Enter a valid amount"), z.literal("")])
		.refine((value) => typeof value === "number" && isValidEmployeeAdvanceAmount(value), "Amount must be greater than 0 with at most 2 decimal places"),
	reason: z.string().trim().min(1, "Reason is required").max(2000, "Reason cannot exceed 2,000 characters"),
	installmentCount: z
		.union([z.number(), z.literal("")])
		.refine((value) => typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 12, "Installments must be a whole number from 1 to 12"),
});

export function isValidEmployeeAdvanceAmount(value: number): boolean {
	return Number.isFinite(value) && value > 0 && Math.abs(value * 100 - Math.round(value * 100)) < Number.EPSILON * 100;
}

export function isValidEmployeeAdvancePeriod(year: number, month: number): boolean {
	return Number.isInteger(year) && year >= 1000 && year <= 9999 && Number.isInteger(month) && month >= 1 && month <= 12;
}

export function getCurrentEmployeeAdvancePeriod(today = new Date()): { year: number; month: number } {
	return { year: today.getFullYear(), month: today.getMonth() + 1 };
}

export function getDefaultEmployeeAdvanceFormValues(): EmployeeAdvanceFormValues {
	return { requestedAmount: "", reason: "", installmentCount: 1 };
}

export function buildEmployeeAdvancePayload(values: EmployeeAdvanceFormValues): CreateEmployeeAdvancePayload {
	return {
		requestedAmount: Number(values.requestedAmount),
		reason: values.reason.trim(),
		installmentCount: Number(values.installmentCount),
	};
}

export function formatEmployeeAdvanceAmount(amount: number | null | undefined): string {
	if (amount === null || amount === undefined || !Number.isFinite(amount)) return "Not recorded";

	return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export function getEmployeeAdvanceStatusLabel(status: EmployeeAdvanceStatus): string {
	return employeeAdvanceStatusLabels[status];
}

export function isScheduledEmployeeAdvanceSettlement(settlement: EmployeeAdvanceSettlement): boolean {
	return settlement.status === "scheduled";
}
