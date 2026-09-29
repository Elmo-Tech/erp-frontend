import { z } from "zod";
import type { CreateEmployeePartialPayPayload, EmployeePartialPayFormValues, EmployeePartialPayKind, EmployeePartialPayStatus } from "../types/employee-partial-pays";

export const employeePartialPayKindLabels: Record<EmployeePartialPayKind, string> = {
	first_month: "First-month pay",
	termination: "Termination pay",
};

export const employeePartialPayStatusLabels: Record<EmployeePartialPayStatus, string> = {
	draft: "Draft",
	approved: "Approved",
	cancelled: "Cancelled",
};

export const employeePartialPayFormSchema = z.object({
	contractId: z.union([z.number().int().positive(), z.literal("")]).refine((value) => typeof value === "number" && value > 0, "Select an employment contract"),
	kind: z.enum(["first_month", "termination"]),
});

export function isValidEmployeePartialPayPeriod(year: number, month: number): boolean {
	return Number.isInteger(year) && year >= 1000 && year <= 9999 && Number.isInteger(month) && month >= 1 && month <= 12;
}

export function getCurrentEmployeePartialPayPeriod(today = new Date()): { year: number; month: number } {
	return { year: today.getFullYear(), month: today.getMonth() + 1 };
}

export function getDefaultEmployeePartialPayFormValues(): EmployeePartialPayFormValues {
	return { contractId: "", kind: "first_month" };
}

export function buildEmployeePartialPayPayload(values: EmployeePartialPayFormValues, payrollYear: number, payrollMonth: number): CreateEmployeePartialPayPayload {
	return {
		contractId: Number(values.contractId),
		kind: values.kind,
		payrollYear,
		payrollMonth,
	};
}

export function formatEmployeePartialPayAmount(amount: number | null | undefined): string {
	if (amount === null || amount === undefined || !Number.isFinite(amount)) return "Not calculated";

	return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export function getEmployeePartialPayKindLabel(kind: EmployeePartialPayKind): string {
	return employeePartialPayKindLabels[kind];
}

export function getEmployeePartialPayStatusLabel(status: EmployeePartialPayStatus): string {
	return employeePartialPayStatusLabels[status];
}

export function getEmployeePartialPayPolicySnapshotValue(snapshot: Record<string, unknown> | null, key: string): unknown {
	if (!snapshot) return undefined;
	if (snapshot[key] !== undefined) return snapshot[key];

	const settings = snapshot.settings;
	return settings && typeof settings === "object" && !Array.isArray(settings) ? (settings as Record<string, unknown>)[key] : undefined;
}
