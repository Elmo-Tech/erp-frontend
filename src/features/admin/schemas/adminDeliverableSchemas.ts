/**
 * Admin Deliverable Schemas
 * Zod validation schemas for admin deliverable operations
 */

import { z } from "zod";

/**
 * Schema for admin updating any deliverable field
 */
export const adminUpdateDeliverableSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters").optional(),
	description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
	acceptanceCriteria: z.string().max(1000, "Acceptance criteria must be less than 1000 characters").optional(),
	submissionNotes: z.string().max(1000, "Submission notes must be less than 1000 characters").optional(),
	reviewNotes: z.string().max(1000, "Review notes must be less than 1000 characters").optional(),
	pointsAwarded: z.number().int().min(0, "Points must be non-negative").max(100, "Points cannot exceed 100").optional(),
	isBonus: z.boolean().optional(),
	order: z.number().int().positive("Order must be positive").optional(),
});

/**
 * Schema for admin changing deliverable status
 */
export const adminChangeStatusSchema = z.object({
	status: z.enum(["pending", "submitted", "under_review", "approved", "rejected"], {
		required_error: "Status is required",
	}),
	reason: z.string().min(3, "Reason must be at least 3 characters").max(500, "Reason must be less than 500 characters"),
});

/**
 * Schema for admin force approve
 */
export const adminForceApproveSchema = z.object({
	reviewNotes: z.string().min(3, "Review notes are required (min 3 characters)").max(1000, "Review notes must be less than 1000 characters"),
	pointsAwarded: z.number().int().min(0, "Points must be non-negative").max(100, "Points cannot exceed 100"),
	isBonus: z.boolean().default(false),
});

/**
 * Schema for admin force reject
 */
export const adminForceRejectSchema = z.object({
	reviewNotes: z.string().min(3, "Review notes are required (min 3 characters)").max(1000, "Review notes must be less than 1000 characters"),
	pointsAwarded: z.number().int().min(0, "Points must be non-negative").max(100, "Points cannot exceed 100").default(0),
});

// Export inferred types
export type AdminUpdateDeliverableFormData = z.infer<typeof adminUpdateDeliverableSchema>;
export type AdminChangeStatusFormData = z.infer<typeof adminChangeStatusSchema>;
export type AdminForceApproveFormData = z.infer<typeof adminForceApproveSchema>;
export type AdminForceRejectFormData = z.infer<typeof adminForceRejectSchema>;
