import { z } from "zod";
import { MilestoneTriggerType } from "@/entities/contract/model/types";
import type { CreateContractPayload, UpdateContractPayload } from "@/entities/contract/model/types";

export const contractPartySchema = z.object({
	company: z.string().min(1, "Company name is required").max(255),
	representative: z.string().min(1, "Representative name is required").max(255),
	title: z.string().max(255).optional(),
	address: z.string().max(500).optional(),
	idNumber: z.string().max(50).optional(),
});

export const contractMilestoneSchema = z.object({
	title: z.string().min(1, "Milestone title is required").max(255),
	description: z.string().max(1000).optional(),
	percentage: z.number().min(0).max(100),
	dueDate: z.string().optional(),
	triggerType: z.enum([MilestoneTriggerType.IMMEDIATE, MilestoneTriggerType.PROJECT_STATUS, MilestoneTriggerType.DELIVERABLE, MilestoneTriggerType.DATE]),
	triggerValue: z.string().max(255).optional(),
});

export type ContractMilestoneFormData = z.infer<typeof contractMilestoneSchema>;
export type ContractPartyFormData = z.infer<typeof contractPartySchema>;

const optionalText = z.string().trim().optional();

export const contractSchema = z.object({
	title: z.string().trim().min(1, "Title is required").max(255),
	projectId: z.number().optional(),
	content: z.string().optional(),
	startDate: z.string().min(1, "Start date is required"),
	endDate: optionalText,
	totalAmount: z.number().min(0).optional(),
	currency: z.string().length(3).optional(),
	paymentTerms: optionalText,
	partyOne: contractPartySchema.optional(),
	partyTwo: contractPartySchema.optional(),
	milestones: z.array(contractMilestoneSchema).optional(),
});

export type ContractFormData = z.infer<typeof contractSchema>;

function cleanOptional(value: string | undefined) {
	const trimmed = value?.trim();
	return trimmed || undefined;
}

export function toCreateContractPayload(data: ContractFormData): CreateContractPayload {
	return {
		title: data.title.trim(),
		projectId: data.projectId,
		content: data.content || "",
		startDate: data.startDate,
		endDate: cleanOptional(data.endDate),
		totalAmount: data.totalAmount,
		currency: data.currency || "USD",
		paymentTerms: cleanOptional(data.paymentTerms),
		partyOne: data.partyOne,
		partyTwo: data.partyTwo,
		milestones: data.milestones?.map((m) => ({
			title: m.title,
			description: m.description,
			percentage: m.percentage,
			dueDate: m.dueDate,
			triggerType: m.triggerType,
			triggerValue: m.triggerValue,
		})),
	};
}

export function toUpdateContractPayload(data: Partial<ContractFormData>): UpdateContractPayload {
	return toCreateContractPayload(data as ContractFormData);
}

export function validateMilestonePercentages(milestones: { percentage: number }[]): { isValid: boolean; total: number; difference: number } {
	const total = milestones.reduce((sum, m) => sum + m.percentage, 0);
	return { isValid: Math.abs(total - 100) < 0.01, total, difference: 100 - total };
}
