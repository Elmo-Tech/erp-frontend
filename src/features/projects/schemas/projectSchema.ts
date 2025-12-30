import { z } from "zod";
import { ProjectStatus } from "../types";

export const createProjectSchema = z.object({
	quotationId: z.number().min(1, "Quotation ID is required"),
	title: z.string().max(255, "Title must be less than 255 characters").optional(),
	description: z.string().optional(),
	deadline: z
		.string()
		.refine((date) => {
			if (!date) return true; // Optional field
			const parsedDate = new Date(date);
			return parsedDate > new Date();
		}, "Deadline must be a future date")
		.optional(),
});

export const updateProjectSchema = z
	.object({
		title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters").optional(),
		description: z.string().optional(),
		status: z.nativeEnum(ProjectStatus).optional(),
		budget: z.number().gt(0, "Budget must be greater than zero").optional(),
		deadline: z
			.string()
			.refine((date) => {
				if (!date) return true; // Optional field
				const parsedDate = new Date(date);
				return parsedDate > new Date();
			}, "Deadline must be a future date")
			.optional(),
		reason: z.string().min(1, "Reason is required when changing budget or deadline").optional(),
	})
	.refine(
		(data) => {
			// If budget or deadline is being changed, reason is required
			if ((data.budget !== undefined || data.deadline !== undefined) && !data.reason) {
				return false;
			}
			return true;
		},
		{
			message: "Reason is required when changing budget or deadline",
			path: ["reason"],
		}
	);

export const convertQuotationSchema = z.object({
	quotationId: z.number().min(1, "Quotation ID is required"),
	title: z.string().max(255, "Title must be less than 255 characters").optional(),
	description: z.string().optional(),
	deadline: z
		.string()
		.refine((date) => {
			if (!date) return true; // Optional field
			const parsedDate = new Date(date);
			return parsedDate > new Date();
		}, "Deadline must be a future date")
		.optional(),
});

export const projectFiltersSchema = z.object({
	search: z.string().optional(),
	status: z.nativeEnum(ProjectStatus).optional(),
	clientId: z.number().min(1).optional(),
	page: z.number().min(1).optional(),
	perPage: z.number().min(1).max(100).optional(),
});

// Export inferred types for form data
export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;
export type ConvertQuotationFormData = z.infer<typeof convertQuotationSchema>;
export type ProjectFiltersFormData = z.infer<typeof projectFiltersSchema>;
