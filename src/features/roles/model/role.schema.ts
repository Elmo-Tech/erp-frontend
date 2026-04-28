import { z } from "zod";

export const createRoleSchema = z.object({
	name: z
		.string()
		.min(1, "Role name is required")
		.transform((value) => value.trim().toLowerCase().replace(/\s+/g, "-"))
		.refine((value) => /^[a-z0-9-_]+$/.test(value), "Use lowercase letters, numbers, hyphens, or underscores"),
	permissions: z.array(z.string()),
});

export type CreateRoleFormData = z.infer<typeof createRoleSchema>;
