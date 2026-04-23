import { z } from "zod";
import { ProjectStatus } from "../types/project";

export const createDirectProjectSchema = z.object({
	clientId: z.number().min(1, "Client is required"),
	title: z.string().min(1, "Title is required").max(255),
	description: z.string().optional(),
	budget: z.number().min(0, "Budget must be at least 0"),
	deadline: z.string().optional(),
	status: z.nativeEnum(ProjectStatus).optional(),
});

export type CreateDirectProjectFormData = z.infer<typeof createDirectProjectSchema>;

export const updateProjectSchema = z.object({
	title: z.string().min(1, "Title is required").max(255).optional(),
	description: z.string().optional(),
	status: z.nativeEnum(ProjectStatus).optional(),
	budget: z.number().min(0, "Budget must be at least 0").optional(),
	deadline: z.string().optional(),
	reason: z.string().optional(),
});

export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;
