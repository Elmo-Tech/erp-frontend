/**
 * Wiki Form Schemas
 */

import { z } from "zod";

export const createWikiSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
	content: z.string().min(1, "Content is required"),
	isEncrypted: z.boolean(),
});

export const updateWikiSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters").optional(),
	content: z.string().min(1, "Content is required").optional(),
	isEncrypted: z.boolean().optional(),
});

export type CreateWikiFormData = z.infer<typeof createWikiSchema>;
export type UpdateWikiFormData = z.infer<typeof updateWikiSchema>;
