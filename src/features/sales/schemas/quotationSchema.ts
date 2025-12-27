import { z } from "zod";
import { QuotationStatus } from "../types";

// Estimations schema with validation for non-negative hours
export const estimationsSchema = z
	.object({
		frontendHours: z.number().min(0, "Frontend hours cannot be negative"),
		backendHours: z.number().min(0, "Backend hours cannot be negative"),
		uiUxHours: z.number().min(0, "UI/UX hours cannot be negative"),
		testingHours: z.number().min(0, "Testing hours cannot be negative"),
		pmHours: z.number().min(0, "PM hours cannot be negative"),
	})
	.catchall(z.number().min(0, "Custom hour values cannot be negative")); // Allow custom categories

export const createQuotationSchema = z.object({
	leadId: z.number().min(1, "Lead ID is required"),
	estimations: estimationsSchema,
	hourlyRate: z.number().gt(0, "Hourly rate must be greater than zero"),
	discountPercentage: z.number().min(0, "Discount percentage cannot be negative").max(100, "Discount percentage cannot exceed 100"),
	currency: z.string().length(3, "Currency must be a 3-character code"),
	status: z.nativeEnum(QuotationStatus).optional(),
});

export const updateQuotationSchema = z.object({
	leadId: z.number().min(1, "Lead ID is required").optional(),
	estimations: estimationsSchema.optional(),
	hourlyRate: z.number().gt(0, "Hourly rate must be greater than zero").optional(),
	discountPercentage: z.number().min(0, "Discount percentage cannot be negative").max(100, "Discount percentage cannot exceed 100").optional(),
	currency: z.string().length(3, "Currency must be a 3-character code").optional(),
	status: z.nativeEnum(QuotationStatus).optional(),
});

export const calculatePricingSchema = z.object({
	estimations: estimationsSchema,
	hourlyRate: z.number().gt(0, "Hourly rate must be greater than zero"),
	discountPercentage: z.number().min(0, "Discount percentage cannot be negative").max(100, "Discount percentage cannot exceed 100"),
});

export const quotationFiltersSchema = z.object({
	search: z.string().optional(),
	status: z.nativeEnum(QuotationStatus).optional(),
	leadId: z.number().min(1).optional(),
	page: z.number().min(1).optional(),
	perPage: z.number().min(1).max(100).optional(),
});

// Export inferred types for form data
export type CreateQuotationFormData = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationFormData = z.infer<typeof updateQuotationSchema>;
export type CalculatePricingFormData = z.infer<typeof calculatePricingSchema>;
export type QuotationFiltersFormData = z.infer<typeof quotationFiltersSchema>;
export type EstimationsFormData = z.infer<typeof estimationsSchema>;
