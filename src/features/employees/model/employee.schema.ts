import { z } from "zod";
import type { CreateEmployeePayload, CreateProjectMemberPayload, ProjectMemberRole } from "@/entities/employee/model/types";

export const createEmployeeSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Enter a valid email"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	role: z.string().min(1, "Role is required"),
	specialization: z.string().optional(),
	isActive: z.boolean(),
	salary: z.number().min(0).optional(),
	workHoursPerDay: z.number().min(1).max(24),
	workStartTime: z.string().min(1, "Start time is required"),
	graceDaysAllowed: z.number().min(0).max(31),
	internalHourlyCost: z.number().min(0).optional(),
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;

export const DEFAULT_EMPLOYEE_ROLE_OPTIONS = [
	{ value: "employee", label: "Employee" },
	{ value: "developer", label: "Developer" },
	{ value: "manager", label: "Manager" },
	{ value: "admin", label: "Admin" },
] as const;

export const addProjectMemberSchema = z.object({
	userId: z.number().int().positive("Employee is required"),
	role: z.enum(["lead", "member", "reviewer"]),
});

export type AddProjectMemberFormData = z.infer<typeof addProjectMemberSchema>;

export function getCreateEmployeeDefaultValues(role?: string): CreateEmployeeFormData {
	return {
		name: "",
		email: "",
		password: "",
		role: role || DEFAULT_EMPLOYEE_ROLE_OPTIONS[0].value,
		specialization: "",
		isActive: true,
		salary: 0,
		workHoursPerDay: 8,
		workStartTime: "10:00",
		graceDaysAllowed: 5,
		internalHourlyCost: 0,
	};
}

export function getAddProjectMemberDefaultValues(): AddProjectMemberFormData {
	return {
		userId: 0,
		role: "member",
	};
}

export function toCreateEmployeePayload(data: CreateEmployeeFormData): CreateEmployeePayload {
	return {
		name: data.name,
		email: data.email,
		password: data.password,
		role: data.role,
		specialization: data.specialization?.trim() || undefined,
		isActive: data.isActive,
		salary: data.salary,
		workHoursPerDay: data.workHoursPerDay,
		workStartTime: data.workStartTime,
		graceDaysAllowed: data.graceDaysAllowed,
		internalHourlyCost: data.internalHourlyCost,
	};
}

export function toCreateProjectMemberPayload(data: AddProjectMemberFormData): CreateProjectMemberPayload {
	return {
		userId: data.userId,
		role: data.role as ProjectMemberRole,
	};
}
