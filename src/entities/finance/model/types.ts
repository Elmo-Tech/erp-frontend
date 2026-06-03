/**
 * entities/finance/model/types.ts
 *
 * All TypeScript interfaces for the Finance domain.
 * Derived directly from FinanceInvoiceResource, FinanceInvoiceItemResource,
 * and SubscriptionResource.
 *
 * NO React Query, NO Zod, NO hooks — pure types only.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared envelope (re-exported for convenience)
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiEnvelope<T> {
	data: T;
	message?: string;
	success?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Invoice Status
// ─────────────────────────────────────────────────────────────────────────────

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type InvoiceType = "one_time" | "subscription";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
	draft: "Draft",
	sent: "Sent",
	paid: "Paid",
	overdue: "Overdue",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
	draft: "secondary",
	sent: "default",
	paid: "success",
	overdue: "destructive",
};

// ─────────────────────────────────────────────────────────────────────────────
// Invoice Item  (FinanceInvoiceItemResource)
// ─────────────────────────────────────────────────────────────────────────────

export interface InvoiceItem {
	id: number;
	invoiceId: number;
	description: string;
	quantity: number;
	unitPrice: number;
	total: number;
	createdAt: string;
	updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Invoice  (FinanceInvoiceResource)
// ─────────────────────────────────────────────────────────────────────────────

export interface Invoice {
	id: number;
	invoiceNumber: string;
	clientId: number;
	projectId: number | null;
	invoiceType: InvoiceType;
	billingCycle: BillingCycle | null;
	subscriptionId: number | null;
	issueDate: string; // YYYY-MM-DD
	dueDate: string; // YYYY-MM-DD
	subtotal: number;
	taxRate: number;
	taxAmount: number;
	discountAmount: number;
	totalAmount: number;
	status: InvoiceStatus;
	notes: string | null;
	client?: {
		id: number;
		name: string;
		displayName?: string;
		companyName?: string | null;
		primaryEmail?: string | null;
		primaryPhone?: string | null;
		status?: string | null;
	} | null;
	project?: {
		id: number;
		title: string;
		status?: string | null;
		budget?: number | null;
		deadline?: string | null;
	} | null;
	items?: InvoiceItem[];
	createdAt: string;
	updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscription  (SubscriptionResource)
// ─────────────────────────────────────────────────────────────────────────────

export type SubscriptionStatus = "active" | "cancelled";
export type BillingCycle = "monthly" | "quarterly" | "semi_annual" | "annual";

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
	active: "Active",
	cancelled: "Cancelled",
};

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
	monthly: "Monthly",
	quarterly: "Quarterly",
	semi_annual: "Semi-Annual",
	annual: "Annual",
};

export interface Subscription {
	id: number;
	clientId: number | null;
	projectId: number | null;
	name: string;
	provider: string | null;
	billingCycle: BillingCycle;
	cost: number;
	currency: string;
	nextBillingDate: string; // YYYY-MM-DD
	status: SubscriptionStatus;
	notes: string | null;
	client?: {
		id: number;
		name: string | null;
	} | null;
	project?: {
		id: number;
		title: string;
	} | null;
	createdAt: string;
	updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Payload types (sent TO the backend)
// ─────────────────────────────────────────────────────────────────────────────

export interface InvoiceItemPayload {
	description: string;
	quantity: number;
	unitPrice: number;
}

export interface CreateInvoicePayload {
	clientId: number;
	projectId?: number | null;
	invoiceType?: InvoiceType;
	billingCycle?: BillingCycle | null;
	issueDate: string;
	dueDate: string;
	taxRate?: number;
	discountAmount?: number;
	status?: InvoiceStatus;
	notes?: string | null;
	items: InvoiceItemPayload[];
}

export type UpdateInvoicePayload = Partial<CreateInvoicePayload>;

export interface CreateSubscriptionPayload {
	name: string;
	provider?: string | null;
	billingCycle: BillingCycle;
	cost: number;
	currency?: string;
	nextBillingDate: string;
	status?: SubscriptionStatus;
	notes?: string | null;
}

export type UpdateSubscriptionPayload = Partial<CreateSubscriptionPayload>;

export interface FinanceFilters {
	clientId?: number;
	projectId?: number;
	status?: string;
	from?: string;
	to?: string;
}
