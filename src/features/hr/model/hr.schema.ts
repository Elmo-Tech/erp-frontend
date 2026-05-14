/**
 * features/hr/model/hr.schema.ts
 *
 * All Zod validation schemas for HR forms.
 * Schemas are derived directly from backend Request validation rules:
 *   - StoreShiftRequest / UpdateShiftRequest
 *   - StoreEmployeeProfileRequest / UpdateEmployeeProfileRequest
 *   - PayslipController@generate validation
 *   - System settings update
 *
 * Follows the same pattern as features/clients/model/client.schema.ts.
 */

import { z } from "zod";
import { nullableNumberInput, requiredNumberInput } from "@/shared/lib/zod-number";

// ─────────────────────────────────────────────────────────────────────────────
// Shift Schema
// Matches: StoreShiftRequest rules
//   name: required, max:100
//   start_time: required, date_format:H:i,H:i:s
//   end_time: required, date_format:H:i,H:i:s, after:start_time
//   working_days: required, array, min:1, each in [Sun..Sat]
//   grace_period_minutes: sometimes, integer, min:0, max:120
// ─────────────────────────────────────────────────────────────────────────────

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

export const shiftSchema = z
	.object({
		name: z.string().min(1, "Shift name is required").max(100, "Name must be 100 characters or less"),
		start_time: z.string().min(1, "Start time is required").regex(TIME_REGEX, "Must be HH:MM format (e.g. 09:00)"),
		end_time: z.string().min(1, "End time is required").regex(TIME_REGEX, "Must be HH:MM format (e.g. 17:00)"),
		working_days: z.array(z.enum(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])).min(1, "Select at least one working day"),
		grace_period_minutes: requiredNumberInput("Grace period is required").pipe(z.number().int("Must be a whole number").min(0, "Cannot be negative").max(120, "Maximum grace period is 120 minutes")).default(0),
	})
	.refine((d) => d.end_time > d.start_time, {
		message: "End time must be after start time",
		path: ["end_time"],
	});

export type ShiftFormData = z.infer<typeof shiftSchema>;

export const SHIFT_DEFAULT_VALUES: ShiftFormData = {
	name: "",
	start_time: "09:00",
	end_time: "17:00",
	working_days: ["Sun", "Mon", "Tue", "Wed", "Thu"],
	grace_period_minutes: 15,
};

// ─────────────────────────────────────────────────────────────────────────────
// Assign HR Profile Schema  (Create)
// Matches: StoreEmployeeProfileRequest rules
//   user_id: required, integer, exists:users,id, unique:employee_profiles,user_id
//   shift_id: nullable, integer, exists:shifts,id
//   base_salary: required, numeric, min:0
//   hourly_rate: required, numeric, min:0
//   join_date: required, date
// ─────────────────────────────────────────────────────────────────────────────

export const assignHrProfileSchema = z.object({
	// FormCombobox always emits a string value — coerce to number before validation
	user_id: requiredNumberInput("Please select a user").pipe(z.number().int().positive("Please select a user")),
	shift_id: nullableNumberInput().pipe(z.number().int().positive().nullable()),
	base_salary: requiredNumberInput("Base salary is required", "Base salary must be a number").pipe(z.number().nonnegative("Base salary cannot be negative")),
	hourly_rate: requiredNumberInput("Hourly rate is required", "Hourly rate must be a number").pipe(z.number().nonnegative("Hourly rate cannot be negative")),
	join_date: z.string().min(1, "Join date is required"),
});

export type AssignHrProfileFormData = z.infer<typeof assignHrProfileSchema>;

export const ASSIGN_HR_PROFILE_DEFAULT_VALUES: AssignHrProfileFormData = {
	user_id: 0,
	shift_id: null,
	base_salary: 0,
	hourly_rate: 0,
	join_date: new Date().toISOString().slice(0, 10),
};

// ─────────────────────────────────────────────────────────────────────────────
// Edit HR Profile Schema  (Update — user_id is immutable)
// Matches: UpdateEmployeeProfileRequest rules
//   shift_id: sometimes, nullable, integer, exists:shifts,id
//   base_salary: sometimes, numeric, min:0
//   hourly_rate: sometimes, numeric, min:0
//   join_date: sometimes, date
// ─────────────────────────────────────────────────────────────────────────────

export const editHrProfileSchema = z.object({
	// FormCombobox always emits a string value — coerce to number before validation
	shift_id: nullableNumberInput().pipe(z.number().int().positive().nullable()),
	base_salary: requiredNumberInput("Base salary is required", "Base salary must be a number").pipe(z.number().nonnegative("Base salary cannot be negative")),
	hourly_rate: requiredNumberInput("Hourly rate is required", "Hourly rate must be a number").pipe(z.number().nonnegative("Hourly rate cannot be negative")),
	join_date: z.string().min(1, "Join date is required"),
});

export type EditHrProfileFormData = z.infer<typeof editHrProfileSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Generate Payroll Schema
// Matches: PayslipController@generate validation
//   user_id: required, integer, exists:users,id
//   month: required, integer, min:1, max:12
//   year: required, integer, min:2020, max:2100
// ─────────────────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

export const generatePayrollSchema = z.object({
	// FormCombobox always emits a string value — coerce to number before validation
	user_id: requiredNumberInput("Please select an employee").pipe(z.number().int().positive("Please select an employee")),
	// FormSelect emits strings for month/year — coerce to number
	month: requiredNumberInput("Month is required").pipe(z.number().int().min(1, "Invalid month").max(12, "Invalid month")),
	year: requiredNumberInput("Year is required").pipe(z.number().int().min(2020, "Year must be 2020 or later").max(CURRENT_YEAR + 1, `Year cannot exceed ${CURRENT_YEAR + 1}`)),
});

export type GeneratePayrollFormData = z.infer<typeof generatePayrollSchema>;

export const GENERATE_PAYROLL_DEFAULT_VALUES: GeneratePayrollFormData = {
	user_id: 0,
	month: new Date().getMonth() + 1,
	year: new Date().getFullYear(),
};

// ─────────────────────────────────────────────────────────────────────────────
// HR Settings Schema  (gamification_point_value)
// ─────────────────────────────────────────────────────────────────────────────

export const hrSettingsSchema = z.object({
	gamification_point_value: requiredNumberInput("Point value is required").pipe(z.number().positive("Value must be greater than 0").max(1000, "Value cannot exceed 1000")),
});

export type HrSettingsFormData = z.infer<typeof hrSettingsSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Leave Request Schema
// Matches: StoreLeaveRequestRequest / UpdateLeaveRequestRequest
//   user_id: required, integer, exists:users,id
//   start_date: required, date
//   end_date: required, date, after_or_equal:start_date
//   type: required, in:annual,sick,unpaid,permission
//   status: sometimes, in:pending,approved,rejected
//   reason: nullable, max:1000
// ─────────────────────────────────────────────────────────────────────────────

export const leaveRequestSchema = z
	.object({
		user_id: requiredNumberInput("Please select an employee").pipe(z.number().int().positive("Please select an employee")),
		start_date: z.string().min(1, "Start date is required"),
		end_date: z.string().min(1, "End date is required"),
		type: z.enum(["annual", "sick", "unpaid", "permission"], { message: "Please select a leave type" }),
		status: z.enum(["pending", "approved", "rejected"]).default("pending"),
		reason: z.string().max(1000, "Reason must be 1000 characters or less").optional().or(z.literal("")),
	})
	.refine((d) => d.end_date >= d.start_date, {
		message: "End date must be on or after start date",
		path: ["end_date"],
	});

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

export const LEAVE_REQUEST_DEFAULT_VALUES: LeaveRequestFormData = {
	user_id: 0,
	start_date: new Date().toISOString().slice(0, 10),
	end_date: new Date().toISOString().slice(0, 10),
	type: "annual",
	status: "pending",
	reason: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Payroll Transaction Schema
// Matches: StorePayrollTransactionRequest / UpdatePayrollTransactionRequest
//   user_id: required, integer, exists:users,id
//   amount: required, numeric, min:0.01
//   type: required, in:manual_bonus,manual_deduction
//   reason: required, max:500
//   transaction_date: required, date
// ─────────────────────────────────────────────────────────────────────────────

export const payrollTransactionSchema = z.object({
	user_id: requiredNumberInput("Please select an employee").pipe(z.number().int().positive("Please select an employee")),
	amount: requiredNumberInput("Amount is required", "Amount must be a number").pipe(z.number().min(0.01, "Amount must be at least 0.01")),
	type: z.enum(["manual_bonus", "manual_deduction"], { message: "Please select a transaction type" }),
	reason: z.string().min(1, "Reason is required").max(500, "Reason must be 500 characters or less"),
	transaction_date: z.string().min(1, "Transaction date is required"),
});

export type PayrollTransactionFormData = z.infer<typeof payrollTransactionSchema>;

export const PAYROLL_TRANSACTION_DEFAULT_VALUES: PayrollTransactionFormData = {
	user_id: 0,
	amount: 0,
	type: "manual_bonus",
	reason: "",
	transaction_date: new Date().toISOString().slice(0, 10),
};
