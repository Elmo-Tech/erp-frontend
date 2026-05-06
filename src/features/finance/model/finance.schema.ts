/**
 * features/finance/model/finance.schema.ts
 *
 * Zod v4 validation schemas for Finance forms.
 * Derived directly from:
 *   - StoreFinanceInvoiceRequest / UpdateFinanceInvoiceRequest
 *   - StoreSubscriptionRequest / UpdateSubscriptionRequest
 *
 * NOTE: Zod v4 uses `error` instead of `invalid_type_error` / `required_error`.
 * z.coerce fields use plain z.number() / z.string() so zodResolver types align.
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Invoice Item Schema
// ─────────────────────────────────────────────────────────────────────────────

export const invoiceItemSchema = z.object({
	description: z.string().min(1, "Description is required").max(500, "Max 500 characters"),
	quantity: z.coerce.number().int("Must be a whole number").min(1, "Quantity must be at least 1"),
	unitPrice: z.coerce.number().nonnegative("Unit price cannot be negative"),
});

export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Invoice Schema
// Matches: StoreFinanceInvoiceRequest rules
// ─────────────────────────────────────────────────────────────────────────────

export const invoiceSchema = z
	.object({
		clientId: z.coerce.number().int().positive("Please select a client"),
		projectId: z.coerce
			.number()
			.int()
			.positive()
			.nullable()
			.optional()
			.transform((v) => (v === 0 || v === null || v === undefined ? null : v)),
		issueDate: z.string().min(1, "Issue date is required"),
		dueDate: z.string().min(1, "Due date is required"),
		taxRate: z.coerce.number().nonnegative("Cannot be negative").max(100, "Cannot exceed 100%").default(0),
		discountAmount: z.coerce.number().nonnegative("Cannot be negative").default(0),
		status: z.enum(["draft", "sent", "paid", "overdue"]).default("draft"),
		notes: z.string().nullable().optional(),
		items: z.array(invoiceItemSchema).min(1, "At least one line item is required"),
	})
	.refine((d) => !d.dueDate || !d.issueDate || d.dueDate >= d.issueDate, {
		message: "Due date must be on or after the issue date",
		path: ["dueDate"],
	});

export type InvoiceFormData = z.output<typeof invoiceSchema>;

export const INVOICE_DEFAULT_VALUES = {
	clientId: 0,
	projectId: null as number | null,
	issueDate: new Date().toISOString().slice(0, 10),
	dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
	taxRate: 0,
	discountAmount: 0,
	status: "draft" as const,
	notes: "",
	items: [{ description: "", quantity: 1, unitPrice: 0 }],
};

// ─────────────────────────────────────────────────────────────────────────────
// Subscription Schema
// Matches: StoreSubscriptionRequest rules
// ─────────────────────────────────────────────────────────────────────────────

export const subscriptionSchema = z.object({
	name: z.string().min(1, "Name is required").max(255, "Max 255 characters"),
	provider: z.string().max(255, "Max 255 characters").nullable().optional(),
	billingCycle: z.enum(["monthly", "yearly"]),
	cost: z.coerce.number().nonnegative("Cost cannot be negative"),
	currency: z.string().length(3, "Currency must be a 3-letter code (e.g. USD)").default("USD"),
	nextBillingDate: z.string().min(1, "Next billing date is required"),
	status: z.enum(["active", "cancelled"]).default("active"),
	notes: z.string().nullable().optional(),
});

export type SubscriptionFormData = z.output<typeof subscriptionSchema>;

export const SUBSCRIPTION_DEFAULT_VALUES = {
	name: "",
	provider: "" as string | null,
	billingCycle: "monthly" as const,
	cost: 0,
	currency: "USD",
	nextBillingDate: new Date().toISOString().slice(0, 10),
	status: "active" as const,
	notes: "",
};
