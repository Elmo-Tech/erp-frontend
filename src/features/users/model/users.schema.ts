/**
 * features/users/model/users.schema.ts
 *
 * Zod schemas for the Users management forms.
 * Mirrors StoreUserRequest / UpdateUserRequest backend validation.
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Available roles — matches the backend RolesAndPermissionsSeeder
// ─────────────────────────────────────────────────────────────────────────────

export const AVAILABLE_ROLES = ["founder", "pmo", "techdev", "dev", "client"] as const;
export type AvailableRole = (typeof AVAILABLE_ROLES)[number];

export const ROLE_LABELS: Record<AvailableRole, string> = {
	founder: "Founder",
	pmo: "PMO",
	techdev: "Tech Dev",
	dev: "Developer",
	client: "Client",
};

// ─────────────────────────────────────────────────────────────────────────────
// Create User Schema
// Matches: StoreUserRequest
//   name: required, string
//   email: required, email, unique:users
//   password: required, confirmed, min:8
//   roles: sometimes, array of role name strings
//   isActive: sometimes, boolean
// ─────────────────────────────────────────────────────────────────────────────

export const createUserSchema = z
	.object({
		name: z.string().min(1, "Name is required").max(255),
		email: z.string().min(1, "Email is required").email("Invalid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		password_confirmation: z.string().min(1, "Please confirm the password"),
		roles: z.array(z.string()).default([]),
		isActive: z.boolean().default(true),
	})
	.refine((d) => d.password === d.password_confirmation, {
		message: "Passwords do not match",
		path: ["password_confirmation"],
	});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export const CREATE_USER_DEFAULT_VALUES: CreateUserFormData = {
	name: "",
	email: "",
	password: "",
	password_confirmation: "",
	roles: [],
	isActive: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// Edit User Schema
// Matches: UpdateUserRequest — all fields optional, password only if provided
// ─────────────────────────────────────────────────────────────────────────────

export const editUserSchema = z
	.object({
		name: z.string().min(1, "Name is required").max(255),
		email: z.string().min(1, "Email is required").email("Invalid email address"),
		// Password is optional on edit — only validated when non-empty
		password: z.string().optional().or(z.literal("")),
		password_confirmation: z.string().optional().or(z.literal("")),
		roles: z.array(z.string()).default([]),
		isActive: z.boolean().default(true),
	})
	.refine(
		(d) => {
			if (!d.password) return true; // no password change — skip
			return d.password === d.password_confirmation;
		},
		{
			message: "Passwords do not match",
			path: ["password_confirmation"],
		},
	);

export type EditUserFormData = z.infer<typeof editUserSchema>;
