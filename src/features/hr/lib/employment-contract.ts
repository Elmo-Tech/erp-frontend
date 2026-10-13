import { z } from "zod";
import type { EmploymentContract, EmploymentContractFormValues, EmploymentContractPayload } from "../types/employment-contract";
import { employmentContractWorkDays } from "../types/employment-contract";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const employmentContractSchema = z
	.object({
		employmentType: z.enum(["full_time", "part_time"]),
		baseSalary: z.number().min(0, "Base salary cannot be negative"),
		requiredMonthlyHours: z.number().positive("Enter a positive monthly hours target").max(744, "Monthly hours cannot exceed 744").nullable().optional(),
		startDate: z.string().refine(isValidContractDate, "Enter a valid start date"),
		durationMonths: z.number().int("Duration must be a whole number of months").min(1, "Duration must be at least 1 month").max(120, "Duration cannot exceed 120 months"),
		workDays: z.array(z.enum(employmentContractWorkDays)).min(1, "Select at least one work day"),
		workHoursPerDay: z.number().min(0.25, "Work hours must be at least 0.25").max(24, "Work hours cannot exceed 24"),
		workStartTime: z.string().regex(timePattern, "Enter a valid start time"),
		status: z.enum(["draft", "active", "expired", "terminated", "superseded"]),
		terminatedOn: z.string(),
		notes: z.string(),
	})
	.superRefine((values, context) => {
		if (values.employmentType === "part_time" && !values.requiredMonthlyHours) {
			context.addIssue({ code: "custom", path: ["requiredMonthlyHours"], message: "Required monthly hours are required for part-time contracts" });
		}
		if (values.status !== "terminated") return;

		if (!values.terminatedOn) {
			context.addIssue({ code: "custom", path: ["terminatedOn"], message: "Termination date is required for a terminated contract" });
			return;
		}

		if (!isValidContractDate(values.terminatedOn)) {
			context.addIssue({ code: "custom", path: ["terminatedOn"], message: "Enter a valid termination date" });
			return;
		}

		if (isValidContractDate(values.startDate) && values.terminatedOn < values.startDate) {
			context.addIssue({ code: "custom", path: ["terminatedOn"], message: "Termination date cannot be before the contract start date" });
		}
	});

export function isValidContractDate(value: string): boolean {
	if (!datePattern.test(value)) return false;

	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));

	return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function deriveContractEndDate(startDate: string, durationMonths: number): string | null {
	if (!isValidContractDate(startDate) || !Number.isInteger(durationMonths) || durationMonths < 1) return null;

	const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
	const targetMonth = startMonth - 1 + durationMonths;
	const targetYear = startYear + Math.floor(targetMonth / 12);
	const normalizedTargetMonth = targetMonth % 12;
	const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, normalizedTargetMonth + 1, 0)).getUTCDate();
	const contractEnd = new Date(Date.UTC(targetYear, normalizedTargetMonth, Math.min(startDay, lastDayOfTargetMonth)));

	contractEnd.setUTCDate(contractEnd.getUTCDate() - 1);
	return contractEnd.toISOString().slice(0, 10);
}

export function getDefaultEmploymentContractFormValues(today = new Date()): EmploymentContractFormValues {
	const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

	return {
		employmentType: "full_time",
		baseSalary: 0,
		requiredMonthlyHours: null,
		startDate: localToday,
		durationMonths: 12,
		workDays: ["sunday", "monday", "tuesday", "wednesday", "thursday"],
		workHoursPerDay: 8,
		workStartTime: "09:00",
		status: "draft",
		terminatedOn: "",
		notes: "",
	};
}

export function toEmploymentContractFormValues(contract: EmploymentContract): EmploymentContractFormValues {
	return {
		employmentType: contract.employmentType,
		baseSalary: contract.baseSalary,
		requiredMonthlyHours: contract.requiredMonthlyHours ?? null,
		startDate: contract.startDate,
		durationMonths: contract.durationMonths,
		workDays: [...contract.workDays],
		workHoursPerDay: contract.workHoursPerDay,
		workStartTime: contract.workStartTime.slice(0, 5),
		status: contract.status,
		terminatedOn: contract.terminatedOn ?? "",
		notes: contract.notes ?? "",
	};
}

export function buildEmploymentContractPayload(values: EmploymentContractFormValues): EmploymentContractPayload {
	const notes = values.notes.trim();

	return {
		employmentType: values.employmentType,
		baseSalary: values.baseSalary,
		requiredMonthlyHours: values.employmentType === "part_time" ? values.requiredMonthlyHours ?? null : null,
		startDate: values.startDate,
		durationMonths: values.durationMonths,
		workDays: [...values.workDays],
		workHoursPerDay: values.workHoursPerDay,
		workStartTime: values.workStartTime,
		status: values.status,
		...(values.status === "terminated" ? { terminatedOn: values.terminatedOn } : {}),
		notes: notes || null,
	};
}
