import { z } from "zod";
import { SUPPORTED_CURRENCIES, type CreateInvoicePayload } from "@/entities/invoice/model/types";

export const createInvoiceSchema = z.object({
	projectId: z.number().int().positive("Project is required"),
	amount: z.number().positive("Amount must be greater than 0"),
	currency: z.enum(SUPPORTED_CURRENCIES),
	dueDate: z.string().min(1, "Due date is required"),
	notes: z.string().max(1000, "Notes must be 1000 characters or less").optional(),
});

export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;

export function getCreateInvoiceDefaultValues(projectId?: number): CreateInvoiceFormData {
	return {
		projectId: projectId ?? 0,
		amount: 0,
		currency: "USD",
		dueDate: "",
		notes: "",
	};
}

export function toCreateInvoicePayload(data: CreateInvoiceFormData): CreateInvoicePayload {
	return {
		projectId: data.projectId,
		amount: data.amount,
		currency: data.currency,
		dueDate: data.dueDate,
		notes: data.notes?.trim() || undefined,
	};
}
