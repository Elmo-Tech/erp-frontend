import { z } from "zod";

export const createProjectWikiSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
	content: z.string().min(1, "Content is required"),
	isEncrypted: z.boolean().optional().default(false),
});

export const updateProjectWikiSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters").optional(),
	content: z.string().min(1, "Content is required").optional(),
	isEncrypted: z.boolean().optional(),
});

export const projectWikiFiltersSchema = z.object({
	projectId: z.number().min(1, "Project ID is required"),
});

// Export inferred types for form data
export type CreateProjectWikiFormData = z.infer<typeof createProjectWikiSchema>;
export type UpdateProjectWikiFormData = z.infer<typeof updateProjectWikiSchema>;
export type ProjectWikiFiltersFormData = z.infer<typeof projectWikiFiltersSchema>;
