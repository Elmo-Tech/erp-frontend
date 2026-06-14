import { z } from "zod";
import { requiredNumberInput } from "@/shared/lib/zod-number";
import type { ChangeRequestStatusValue, CreateChangeRequestPayload } from "@/features/projects/api/execution.api";

export const changeRequestStatusOptions = [
	{ value: "draft", label: "Draft" },
	{ value: "sent_to_client", label: "Sent to Client" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
] satisfies { value: ChangeRequestStatusValue; label: string }[];

export const createChangeRequestSchema = z.object({
	title: z.string().trim().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
	description: z.string().trim().min(1, "Description is required"),
	price: requiredNumberInput("Price is required", "Price must be a number").pipe(z.number().min(0, "Price must be at least 0")),
});

export type CreateChangeRequestFormData = z.infer<typeof createChangeRequestSchema>;

export const createChangeRequestFormDefaults: CreateChangeRequestFormData = {
	title: "",
	description: "",
	price: 0,
};

export function mapCreateChangeRequestFormToPayload(data: CreateChangeRequestFormData): CreateChangeRequestPayload {
	return {
		title: data.title,
		description: data.description,
		price: data.price,
	};
}
