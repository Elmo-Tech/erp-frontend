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
		grace_period_minutes: z.number({ invalid_type_error: "Must be a whole number" }).int("Must be a whole number").min(0, "Cannot be negative").max(120, "Maximum grace period is 120 minutes").default(0),
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
	user_id: z.coerce.number({ invalid_type_error: "Please select a user" }).int().positive("Please select a user"),
	shift_id: z.coerce
		.number()
		.int()
		.positive()
		.nullable()
		.optional()
		.transform((v) => (v === 0 || v === null || v === undefined ? null : v)),
	base_salary: z.coerce.number({ invalid_type_error: "Base salary must be a number" }).nonnegative("Base salary cannot be negative"),
	hourly_rate: z.coerce.number({ invalid_type_error: "Hourly rate must be a number" }).nonnegative("Hourly rate cannot be negative"),
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
	shift_id: z.coerce
		.number()
		.int()
		.positive()
		.nullable()
		.optional()
		.transform((v) => (v === 0 || v === null || v === undefined ? null : v)),
	base_salary: z.coerce.number({ invalid_type_error: "Base salary must be a number" }).nonnegative("Base salary cannot be negative"),
	hourly_rate: z.coerce.number({ invalid_type_error: "Hourly rate must be a number" }).nonnegative("Hourly rate cannot be negative"),
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
	user_id: z.coerce.number({ invalid_type_error: "Please select an employee" }).int().positive("Please select an employee"),
	// FormSelect emits strings for month/year — coerce to number
	month: z.coerce.number({ invalid_type_error: "Month is required" }).int().min(1, "Invalid month").max(12, "Invalid month"),
	year: z.coerce
		.number({ invalid_type_error: "Year is required" })
		.int()
		.min(2020, "Year must be 2020 or later")
		.max(CURRENT_YEAR + 1, `Year cannot exceed ${CURRENT_YEAR + 1}`),
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
	gamification_point_value: z.number({ invalid_type_error: "Must be a number" }).positive("Value must be greater than 0").max(1000, "Value cannot exceed 1000"),
});

export type HrSettingsFormData = z.infer<typeof hrSettingsSchema>;
