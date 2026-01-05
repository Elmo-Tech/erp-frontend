import { z } from "zod";
import { MilestoneTriggerType } from "../types";

export const contractPartySchema = z.object({
	company: z.string().min(1, "Company name is required").max(255, "Company name must be less than 255 characters"),
	representative: z.string().min(1, "Representative name is required").max(255, "Representative name must be less than 255 characters"),
	title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
	address: z.string().max(500, "Address must be less than 500 characters").optional(),
	idNumber: z.string().max(50, "ID number must be less than 50 characters").optional(),
});

export const contractMilestoneSchema = z.object({
	title: z.string().min(1, "Milestone title is required").max(255, "Title must be less than 255 characters"),
	description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
	amount: z.number().min(0, "Amount must be positive"),
	percentage: z.number().min(0, "Percentage must be positive").max(100, "Percentage cannot exceed 100%"),
	dueDate: z.string().optional(),
	triggerType: z.enum([MilestoneTriggerType.IMMEDIATE, MilestoneTriggerType.PROJECT_STATUS, MilestoneTriggerType.DELIVERABLE, MilestoneTriggerType.DATE]),
	triggerValue: z.string().max(255, "Trigger value must be less than 255 characters").optional(),
	sortOrder: z.number().min(0, "Sort order must be positive"),
});

export const createContractSchema = z.object({
	quotationId: z.string().optional(),
	projectId: z.number().optional(),
	templateId: z.number().optional(),
	title: z.string().min(1, "Contract title is required").max(255, "Title must be less than 255 characters"),
	content: z.string().min(1, "Contract content is required"),
	partyOne: contractPartySchema,
	partyTwo: contractPartySchema,
	totalAmount: z.coerce.number().min(0, "Total amount must be positive"),
	currency: z.string().min(3, "Currency must be 3 characters").max(3, "Currency must be 3 characters").default("USD"),
	paymentTerms: z.string().max(1000, "Payment terms must be less than 1000 characters").optional(),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().optional(),
	milestones: z.array(contractMilestoneSchema).optional(),
});

export const updateContractSchema = createContractSchema.partial();

export const signContractSchema = z.object({
	signedByClient: z.string().min(1, "Client signature is required").max(255, "Signature must be less than 255 characters"),
});

export type CreateContractFormData = z.infer<typeof createContractSchema>;
export type UpdateContractFormData = z.infer<typeof updateContractSchema>;
export type SignContractFormData = z.infer<typeof signContractSchema>;
export type ContractPartyFormData = z.infer<typeof contractPartySchema>;
export type ContractMilestoneFormData = z.infer<typeof contractMilestoneSchema>;
