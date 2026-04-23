import { z } from "zod";
import { MilestoneTriggerType } from "../types";

// Re-export PaymentMilestone type from quotation schema
export type { PaymentMilestone, DEFAULT_MILESTONE_TEMPLATES } from "./quotationSchema";
import { DEFAULT_MILESTONE_TEMPLATES } from "./quotationSchema";

// Milestone schema for contracts (adapted from quotation)
export const contractMilestoneSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1, "Milestone title is required").max(255, "Title must be less than 255 characters"),
	description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
	percentage: z.number().min(0, "Percentage must be positive").max(100, "Percentage cannot exceed 100%"),
	amount: z.number().min(0).default(0),
	sortOrder: z.number().min(0).default(0),
	dueDate: z.string().optional(),
	triggerType: z.enum([MilestoneTriggerType.IMMEDIATE, MilestoneTriggerType.PROJECT_STATUS, MilestoneTriggerType.DELIVERABLE, MilestoneTriggerType.DATE]).default(MilestoneTriggerType.DATE),
	triggerValue: z.string().max(255, "Trigger value must be less than 255 characters").optional(),
});

// Party schema for contracts
export const contractPartySchema = z.object({
	company: z.string().min(1, "Company name is required").max(255, "Company name must be less than 255 characters"),
	representative: z.string().min(1, "Representative name is required").max(255, "Representative name must be less than 255 characters"),
	title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
	address: z.string().max(500, "Address must be less than 500 characters").optional(),
	idNumber: z.string().max(50, "ID number must be less than 50 characters").optional(),
});

// Base shared fields for all contract types
const baseContractFields = z.object({
	title: z.string().min(1, "Contract title is required").max(255, "Title must be less than 255 characters"),
	expiryDays: z.number().min(1, "Expiry days must be at least 1").max(365, "Expiry days cannot exceed 365"),
	projectDuration: z.string().min(1, "Project duration is required").max(100, "Project duration is too long"),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().min(1, "End date is required"),
	deliverables: z.array(z.string()).min(1, "At least one deliverable is required"),
	content: z.string().optional().default(""),
	partyOne: contractPartySchema.optional(),
	partyTwo: contractPartySchema.optional(),
	totalAmount: z.number().min(0, "Total amount must be positive").default(0),
	currency: z.string().length(3, "Currency must be 3 characters").default("USD"),
	paymentTerms: z.string().optional().default(""),
	milestones: z.array(contractMilestoneSchema).optional().default([]),
});

// Schema for "from_quotation" data source
const fromQuotationSchema = baseContractFields.extend({
	dataSource: z.literal("from_quotation"),
	quotationId: z.number().min(1, "Quotation ID is required when creating from quotation"),
});

// Schema for "new_terms" data source
const newTermsSchema = baseContractFields.extend({
	dataSource: z.literal("new_terms"),
	totalAmount: z.number().min(0, "Total amount must be positive"),
	currency: z.string().length(3, "Currency must be 3 characters").default("USD"),
	milestones: z.array(contractMilestoneSchema).min(1, "At least one milestone is required"),
});

// Discriminated union schema - validates based on dataSource
export const createContractSchema = z.discriminatedUnion("dataSource", [fromQuotationSchema, newTermsSchema]);

// Validation helper to check if milestones sum to 100%
export function validateMilestonePercentages(milestones: { percentage: number }[]): { isValid: boolean; total: number; difference: number } {
	const total = milestones.reduce((sum, m) => sum + m.percentage, 0);
	return {
		isValid: Math.abs(total - 100) < 0.01,
		total,
		difference: 100 - total,
	};
}

/**
 * Get default milestones based on template
 * For use in the CreateContractDialog
 */
export function getDefaultMilestones(template: keyof typeof DEFAULT_MILESTONE_TEMPLATES = "standard") {
	return DEFAULT_MILESTONE_TEMPLATES[template].map((m, index) => ({
		id: `milestone-${Date.now()}-${index}`,
		name: m.name,
		percentage: m.percentage,
	}));
}

// Type exports
export type CreateContractFromQuotation = z.infer<typeof fromQuotationSchema>;
export type CreateContractNewTerms = z.infer<typeof newTermsSchema>;
export type CreateContractFormData = z.infer<typeof createContractSchema>;
export type ContractMilestoneFormData = z.infer<typeof contractMilestoneSchema>;
export type ContractPartyFormData = z.infer<typeof contractPartySchema>;

const fromQuotationSchemaPartial = fromQuotationSchema.partial();
const newTermsSchemaPartial = newTermsSchema.partial();

export const updateContractSchema = z.discriminatedUnion("dataSource", [fromQuotationSchemaPartial, newTermsSchemaPartial]);
export type UpdateContractFormData = z.infer<typeof updateContractSchema>;
