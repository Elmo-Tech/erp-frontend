import { z } from "zod";

export const createInvoiceSchema = z.object({
	projectId: z.number().min(1, "Project is required"),
	amount: z.number().min(0.01, "Amount must be greater than 0"),
	currency: z.string().length(3, "Currency must be 3 characters").optional(),
	dueDate: z.string().min(1, "Due date is required"),
	notes: z.string().max(1000).optional(),
});

export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;
