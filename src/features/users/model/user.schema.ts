import { z } from "zod";

const optionalCost = z.preprocess((value) => {
	if (value === "" || value === null || value === undefined) return undefined;
	return Number(value);
}, z.number().min(0, "Cost must be positive").optional());

export const createUserSchema = z
	.object({
		name: z.string().min(1, "Name is required").max(255),
		email: z.string().min(1, "Email is required").email("Invalid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		password_confirmation: z.string().min(1, "Please confirm password"),
		skillsText: z.string().optional(),
		roles: z.array(z.string()),
		specialization: z.string().optional(),
		isActive: z.boolean(),
		internalHourlyCost: optionalCost,
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: "Passwords do not match",
		path: ["password_confirmation"],
	});

export const updateUserSchema = z
	.object({
		name: z.string().min(1, "Name is required").max(255),
		email: z.string().min(1, "Email is required").email("Invalid email address"),
		password: z.string().optional(),
		password_confirmation: z.string().optional(),
		skillsText: z.string().optional(),
		roles: z.array(z.string()),
		specialization: z.string().optional(),
		isActive: z.boolean(),
		internalHourlyCost: optionalCost,
	})
	.refine((data) => !data.password || data.password.length >= 8, {
		message: "Password must be at least 8 characters",
		path: ["password"],
	})
	.refine((data) => !data.password || data.password === data.password_confirmation, {
		message: "Passwords do not match",
		path: ["password_confirmation"],
	});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type CreateUserFormValues = z.input<typeof createUserSchema>;
export type UpdateUserFormValues = z.input<typeof updateUserSchema>;

export function parseSkills(skillsText?: string) {
	return (skillsText || "")
		.split(",")
		.map((skill) => skill.trim())
		.filter(Boolean);
}
