import { z } from "zod";
import { ClientStatus, ClientType, type Client } from "@/entities/client/model/types";
import type { CreateClientPayload, UpdateClientPayload } from "@/entities/client/model/types";

const formText = z.string().trim();
const requiredFormText = (message: string) => z.string().trim().min(1, message);
const optionalEmail = z.string().trim().email("Invalid email").optional().or(z.literal(""));
const optionalNullableText = z.string().trim().nullable().optional();

const addClientClassificationSchema = z.object({
	country: requiredFormText("Country is required"),
	status: z.nativeEnum(ClientStatus),
	accountManagerId: optionalNullableText,
	leadSource: requiredFormText("Lead source is required"),
	interests: z.array(z.string()),
	notes: formText,
});

const inactiveIndividualFieldsSchema = {
	firstName: formText.optional(),
	lastName: formText.optional(),
	individualPhone: formText.optional(),
	individualEmail: optionalEmail,
};

const inactiveCompanyFieldsSchema = {
	companyName: formText.optional(),
	companyPhone: formText.optional(),
	companyEmail: optionalEmail,
	contactFirstName: formText.optional(),
	contactLastName: formText.optional(),
	contactPhone: formText.optional(),
	contactEmail: optionalEmail,
};

const addCompanyClientSchema = addClientClassificationSchema.extend({
	type: z.literal(ClientType.COMPANY),
	companyName: requiredFormText("Company name is required"),
	companyPhone: formText,
	companyEmail: z.string().trim().min(1, "Company email is required").email("Invalid email"),
	contactFirstName: requiredFormText("Contact first name is required"),
	contactLastName: requiredFormText("Contact last name is required"),
	contactPhone: formText,
	contactEmail: optionalEmail,
	...inactiveIndividualFieldsSchema,
});

const addIndividualClientSchema = addClientClassificationSchema.extend({
	type: z.literal(ClientType.INDIVIDUAL),
	firstName: requiredFormText("First name is required"),
	lastName: requiredFormText("Last name is required"),
	individualPhone: formText,
	individualEmail: z.string().trim().min(1, "Email is required").email("Invalid email"),
	...inactiveCompanyFieldsSchema,
});

export const addClientSchema = z.discriminatedUnion("type", [addCompanyClientSchema, addIndividualClientSchema]);

export type AddClientFormData = z.infer<typeof addClientSchema>;

export const DEFAULT_ADD_CLIENT_VALUES: AddClientFormData = {
	type: ClientType.COMPANY,
	companyName: "",
	companyPhone: "",
	companyEmail: "",
	contactFirstName: "",
	contactLastName: "",
	contactPhone: "",
	contactEmail: "",
	firstName: "",
	lastName: "",
	individualPhone: "",
	individualEmail: "",
	country: "",
	status: ClientStatus.ACTIVE,
	accountManagerId: "",
	leadSource: "",
	interests: [],
	notes: "",
};

function cleanOptional(value: string | undefined) {
	const trimmedValue = value?.trim();
	return trimmedValue || undefined;
}

function toNumberOrUndefined(value: string | null | undefined) {
	const numericValue = Number(value);
	return value && Number.isFinite(numericValue) ? numericValue : undefined;
}

export function toAddClientPayload(data: AddClientFormData): CreateClientPayload {
	const accountManagerId = toNumberOrUndefined(data.accountManagerId);
	const interests = data.interests.filter(Boolean);

	if (data.type === ClientType.COMPANY) {
		const companyName = data.companyName.trim();
		const contactDisplayName = [data.contactFirstName, data.contactLastName].map((value) => value?.trim()).filter(Boolean).join(" ");

		return {
			type: ClientType.COMPANY,
			name: companyName,
			email: data.companyEmail.trim(),
			phone: cleanOptional(data.companyPhone),
			company: companyName,
			displayName: companyName,
			companyName,
			primaryEmail: data.companyEmail.trim(),
			primaryPhone: cleanOptional(data.companyPhone),
			country: cleanOptional(data.country),
			status: data.status,
			source: cleanOptional(data.leadSource),
			accountManagerId,
			interests,
			contactPerson: contactDisplayName
				? {
						firstName: cleanOptional(data.contactFirstName),
						lastName: cleanOptional(data.contactLastName),
						displayName: contactDisplayName,
						email: cleanOptional(data.contactEmail),
						phone: cleanOptional(data.contactPhone),
						isPrimary: true,
					}
				: undefined,
			metadata: interests.length > 0 ? { interests } : undefined,
			notes: cleanOptional(data.notes),
		};
	}

	const displayName = [data.firstName, data.lastName].map((value) => value?.trim()).filter(Boolean).join(" ");

	return {
		type: ClientType.INDIVIDUAL,
		name: displayName,
		email: data.individualEmail.trim(),
		phone: cleanOptional(data.individualPhone),
		displayName,
		primaryEmail: data.individualEmail.trim(),
		primaryPhone: cleanOptional(data.individualPhone),
		country: cleanOptional(data.country),
		status: data.status,
		source: cleanOptional(data.leadSource),
		accountManagerId,
		interests,
		metadata: interests.length > 0 ? { interests } : undefined,
		notes: cleanOptional(data.notes),
	};
}

export function toEditClientPayload(data: AddClientFormData): UpdateClientPayload {
	return toAddClientPayload(data);
}

export function toAddClientFormData(client: Client): AddClientFormData {
	const interests = Array.isArray(client.interests)
		? client.interests
		: Array.isArray(client.metadata?.interests)
			? client.metadata.interests.filter((interest): interest is string => typeof interest === "string")
			: [];
	const primaryContact = client.contacts?.find((contact) => contact.isPrimary) ?? client.contacts?.[0];
	const displayName = client.displayName || client.name || "";
	const [firstName = "", ...lastNameParts] = displayName.split(" ").filter(Boolean);
	const lastName = lastNameParts.join(" ");

	if (client.type === ClientType.INDIVIDUAL) {
		return {
			...DEFAULT_ADD_CLIENT_VALUES,
			type: ClientType.INDIVIDUAL,
			firstName,
			lastName,
			individualPhone: client.primaryPhone || client.phone || "",
			individualEmail: client.primaryEmail || client.email || "",
			country: client.country || "",
			status: client.status || ClientStatus.ACTIVE,
			accountManagerId: client.accountManagerId ? String(client.accountManagerId) : "",
			leadSource: client.source || "",
			interests,
			notes: client.notes || "",
		};
	}

	const companyName = client.companyName || client.company || displayName;

	return {
		...DEFAULT_ADD_CLIENT_VALUES,
		type: ClientType.COMPANY,
		companyName,
		companyPhone: client.primaryPhone || client.phone || "",
		companyEmail: client.primaryEmail || client.email || "",
		contactFirstName: primaryContact?.firstName || firstName,
		contactLastName: primaryContact?.lastName || lastName || companyName,
		contactPhone: primaryContact?.phone || "",
		contactEmail: primaryContact?.email || "",
		country: client.country || "",
		status: client.status || ClientStatus.ACTIVE,
		accountManagerId: client.accountManagerId ? String(client.accountManagerId) : "",
		leadSource: client.source || "",
		interests,
		notes: client.notes || "",
	};
}
