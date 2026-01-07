/**
 * User Form Schemas
 * Zod validation schemas for user forms.
 */

import { z } from "zod";

export const createUserSchema = z
	.object({
		name: z.string().min(1, "Name is required").max(255),
		email: z.string().min(1, "Email is required").email("Invalid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		password_confirmation: z.string().min(1, "Please confirm password"),
		skills: z.array(z.string()).optional().default([]),
		roles: z.array(z.string()).optional().default([]),
		specialization: z.string().optional(),
		isActive: z.boolean().optional().default(true),
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: "Passwords do not match",
		path: ["password_confirmation"],
	});

export const updateUserSchema = z
	.object({
		name: z.string().min(1, "Name is required").max(255).optional(),
		email: z.string().email("Invalid email address").optional(),
		password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
		password_confirmation: z.string().optional().or(z.literal("")),
		skills: z.array(z.string()).optional(),
		roles: z.array(z.string()).optional(),
		specialization: z.string().optional(),
		isActive: z.boolean().optional(),
	})
	.refine(
		(data) => {
			if (data.password && data.password.length > 0) {
				return data.password === data.password_confirmation;
			}
			return true;
		},
		{
			message: "Passwords do not match",
			path: ["password_confirmation"],
		}
	);

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
