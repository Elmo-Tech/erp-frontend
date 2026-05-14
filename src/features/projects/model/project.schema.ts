import { z } from "zod";
import { ProjectStatus } from "@/entities/project/model/types";
import type { CreateDirectProjectPayload, UpdateProjectPayload } from "@/entities/project/model/types";
import { requiredNumberInput } from "@/shared/lib/zod-number";

export const createDirectProjectSchema = z.object({
	clientId: requiredNumberInput("Client is required").pipe(z.number().int().min(1, "Client is required")),
	title: z.string().trim().min(1, "Title is required").max(255),
	description: z.string().trim().optional().or(z.literal("")),
	budget: requiredNumberInput("Budget is required").pipe(z.number().min(0, "Budget must be at least 0")),
	deadline: z.string().optional().or(z.literal("")),
	status: z.nativeEnum(ProjectStatus),
	reason: z.string().trim().optional().or(z.literal("")),
});

export type CreateDirectProjectFormData = z.infer<typeof createDirectProjectSchema>;

function cleanOptional(value: string | undefined) {
	const trimmedValue = value?.trim();
	return trimmedValue || undefined;
}

export function toCreateDirectProjectPayload(data: CreateDirectProjectFormData): CreateDirectProjectPayload {
	return {
		clientId: data.clientId,
		title: data.title.trim(),
		description: cleanOptional(data.description),
		budget: data.budget,
		deadline: cleanOptional(data.deadline),
		status: data.status,
	};
}

export function toUpdateProjectPayload(data: CreateDirectProjectFormData): UpdateProjectPayload {
	return {
		title: data.title.trim(),
		description: cleanOptional(data.description),
		budget: data.budget,
		deadline: cleanOptional(data.deadline),
		status: data.status,
		reason: cleanOptional(data.reason),
	};
}
