import { z } from "zod";

const subtaskSchema = z.object({
	title: z.string().min(1, "Subtask title is required"),
	description: z.string().optional(),
	estimatedHours: z.number().positive().optional(),
	priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export const taskTemplateSchema = z.object({
	name: z.string().min(1, "Template name is required").max(255, "Name is too long"),
	description: z.string().optional(),
	category: z.string().optional(),
	code: z.string().max(50, "Code is too long").optional(),
	defaultValues: z.record(z.string(), z.any()).optional(),
	subtasks: z.array(subtaskSchema).optional(),
	isActive: z.boolean().default(true),
});

export const instantiateTaskSchema = z.object({
	projectId: z.number().positive("Invalid project"),
	parentId: z.number().positive().optional(),
	overrides: z.record(z.string(), z.any()).optional(),
});

export type TaskTemplateFormData = z.infer<typeof taskTemplateSchema>;
export type InstantiateTaskFormData = z.infer<typeof instantiateTaskSchema>;
