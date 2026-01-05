import { z } from "zod";

export const innovationLogSchema = z.object({
	toolName: z.string().min(2, "Tool name is required (min 2 characters)"),
	category: z.enum(["ai_tool", "automation", "new_tech", "process_improvement"]),
	description: z.string().min(10, "Description must be at least 10 characters"),
	impactDescription: z.string().optional(),
	impactLevel: z.enum(["low", "medium", "high"]),
	timeSavedMinutes: z.union([z.number().min(0), z.string()]).optional(),
});

export type InnovationLogFormData = z.infer<typeof innovationLogSchema>;
