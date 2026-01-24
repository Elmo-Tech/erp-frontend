import { z } from "zod";

/**
 * Schema for creating a new deliverable
 */
export const createDeliverableSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
	description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
	acceptanceCriteria: z.string().max(1000, "Acceptance criteria must be less than 1000 characters").optional(),
	isBonus: z.boolean().default(false),
	order: z.number().int().positive().optional(),
});

/**
 * Schema for updating an existing deliverable
 */
export const updateDeliverableSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters").optional(),
	description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
	acceptanceCriteria: z.string().max(1000, "Acceptance criteria must be less than 1000 characters").optional(),
	isBonus: z.boolean().optional(),
	order: z.number().int().positive().optional(),
});

/**
 * Schema for submitting a deliverable
 */
export const submitDeliverableSchema = z.object({
	submissionNotes: z.string().max(1000, "Submission notes must be less than 1000 characters").optional(),
});

/**
 * Schema for reviewing a deliverable (approve/reject)
 */
export const reviewDeliverableSchema = z.object({
	pointsAwarded: z.number().int().min(0, "Points awarded must be non-negative").max(10, "Points awarded cannot exceed 10").optional(),
	pointsDeducted: z.number().int().min(0, "Points deducted must be non-negative").max(10, "Points deducted cannot exceed 10").optional(),
	reviewNotes: z.string().max(1000, "Review notes must be less than 1000 characters").optional(),
});

/**
 * Schema for reordering deliverables
 */
export const reorderDeliverablesSchema = z.object({
	deliverableIds: z.array(z.number().int().positive()).min(1, "At least one deliverable ID is required"),
});

// Export inferred types
export type CreateDeliverableFormData = z.infer<typeof createDeliverableSchema>;
export type UpdateDeliverableFormData = z.infer<typeof updateDeliverableSchema>;
export type SubmitDeliverableFormData = z.infer<typeof submitDeliverableSchema>;
export type ReviewDeliverableFormData = z.infer<typeof reviewDeliverableSchema>;
export type ReorderDeliverablesFormData = z.infer<typeof reorderDeliverablesSchema>;
