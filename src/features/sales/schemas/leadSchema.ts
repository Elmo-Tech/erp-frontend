import { z } from "zod";
import { LeadStatus } from "../types";

export const createLeadSchema = z.object({
	name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
	email: z.string().email("Invalid email format").max(255, "Email must be less than 255 characters"),
	company: z.string().max(255, "Company must be less than 255 characters").optional(),
	source: z.string().max(255, "Source must be less than 255 characters").optional(),
	status: z.nativeEnum(LeadStatus).optional(),
});

export const updateLeadSchema = z.object({
	name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters").optional(),
	email: z.string().email("Invalid email format").max(255, "Email must be less than 255 characters").optional(),
	company: z.string().max(255, "Company must be less than 255 characters").optional(),
	source: z.string().max(255, "Source must be less than 255 characters").optional(),
	status: z.nativeEnum(LeadStatus).optional(),
});

export const leadFiltersSchema = z.object({
	search: z.string().optional(),
	status: z.nativeEnum(LeadStatus).optional(),
	page: z.number().min(1).optional(),
	perPage: z.number().min(1).max(100).optional(),
});

export type CreateLeadFormData = z.infer<typeof createLeadSchema>;
export type UpdateLeadFormData = z.infer<typeof updateLeadSchema>;
export type LeadFiltersFormData = z.infer<typeof leadFiltersSchema>;
