import { z } from "zod";
import { ClientStatus } from "@/lib/statusHelpers";

export const clientSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
	phone: z.string().optional(),
	company: z.string().optional(),
	position: z.string().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	country: z.string().optional(),
	website: z.string().url("Invalid URL").optional().or(z.literal("")),
	notes: z.string().optional(),
	status: z.nativeEnum(ClientStatus),
});

export type ClientFormData = z.infer<typeof clientSchema>;
