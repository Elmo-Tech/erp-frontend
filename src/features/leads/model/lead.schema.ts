import { z } from "zod";
import { LeadStatus, LeadSource, LeadPriority, LeadTemperature } from "@/entities/lead/model/types";
import type { CreateLeadPayload, UpdateLeadPayload } from "@/entities/lead/model/types";

const optionalText = z.string().trim().optional();

export const leadSchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(255),
	email: z.string().trim().email("Invalid email").max(255),
	phone: optionalText,
	company: optionalText,
	projectName: optionalText,
	country: optionalText,
	source: z.nativeEnum(LeadSource).optional(),
	priority: z.nativeEnum(LeadPriority).optional(),
	leadTemperature: z.nativeEnum(LeadTemperature).optional(),
	expectedBudget: z.number().min(0).optional(),
	expectedCloseDate: z.string().optional(),
	notes: optionalText,
	status: z.nativeEnum(LeadStatus).optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;

function cleanOptional(value: string | undefined) {
	const trimmed = value?.trim();
	return trimmed || undefined;
}

export function toCreateLeadPayload(data: LeadFormData): CreateLeadPayload {
	return {
		name: data.name.trim(),
		email: data.email.trim(),
		phone: cleanOptional(data.phone),
		company: cleanOptional(data.company),
		projectName: cleanOptional(data.projectName),
		country: cleanOptional(data.country),
		source: data.source,
		priority: data.priority,
		leadTemperature: data.leadTemperature,
		expectedBudget: data.expectedBudget,
		expectedCloseDate: cleanOptional(data.expectedCloseDate),
		notes: cleanOptional(data.notes),
		status: data.status,
	};
}

export function toUpdateLeadPayload(data: Partial<LeadFormData>): UpdateLeadPayload {
	return toCreateLeadPayload(data as LeadFormData);
}
