import { z } from "zod";
import { ClientStatus } from "@/entities/client/model/types";
import type { CreateClientPayload, UpdateClientPayload } from "@/entities/client/model/types";

const optionalText = z.string().trim().optional().or(z.literal(""));

export const clientSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	email: z.string().trim().email("Invalid email"),
	phone: optionalText,
	company: optionalText,
	position: optionalText,
	address: optionalText,
	city: optionalText,
	country: optionalText,
	website: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
	notes: optionalText,
	status: z.nativeEnum(ClientStatus),
});

export type ClientFormData = z.infer<typeof clientSchema>;

function cleanOptional(value: string | undefined) {
	const trimmedValue = value?.trim();
	return trimmedValue || undefined;
}

export function toCreateClientPayload(data: ClientFormData): CreateClientPayload {
	return {
		name: data.name.trim(),
		email: data.email.trim(),
		phone: cleanOptional(data.phone),
		company: cleanOptional(data.company),
		position: cleanOptional(data.position),
		address: cleanOptional(data.address),
		city: cleanOptional(data.city),
		country: cleanOptional(data.country),
		website: cleanOptional(data.website),
		notes: cleanOptional(data.notes),
		status: data.status,
	};
}

export function toUpdateClientPayload(data: ClientFormData): UpdateClientPayload {
	return toCreateClientPayload(data);
}
