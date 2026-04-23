import { InvoiceStatus, InvoiceStatusColors, InvoiceStatusLabels } from "@/shared/lib/statusHelpers";

export { InvoiceStatus, InvoiceStatusColors, InvoiceStatusLabels };

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "SAR", "AED", "EGP"] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];
export type TaxMode = "exclusive" | "inclusive" | "none";

export interface InvoiceProjectSummary {
	projectId: number;
	title: string;
	clientId?: number | null;
}

export interface InvoiceClientSummary {
	clientId: number;
	name: string;
	email?: string | null;
	company?: string | null;
}

export interface InvoiceTaxBreakdown {
	mode: TaxMode;
	rate: number;
	subtotal: number;
	taxAmount: number;
	total: number;
	currency: CurrencyCode | string;
}

export interface Invoice {
	invoiceId: number;
	projectId: number;
	invoiceNumber: string;
	amount: number;
	currency: CurrencyCode | string;
	status: InvoiceStatus;
	dueDate: string;
	paidAt: string | null;
	notes: string | null;
	project?: InvoiceProjectSummary | null;
	client?: InvoiceClientSummary | null;
	tax?: InvoiceTaxBreakdown | null;
	createdAt: string;
	updatedAt: string;
}

export interface CreateInvoicePayload {
	projectId: number;
	amount: number;
	currency?: CurrencyCode;
	dueDate: string;
	notes?: string;
}

export interface UpdateInvoicePayload {
	amount?: number;
	currency?: CurrencyCode | string;
	status?: InvoiceStatus;
	dueDate?: string;
	notes?: string | null;
}

export interface InvoicePagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

export interface InvoiceListResponse {
	invoices: Invoice[];
	pagination: InvoicePagination;
}

export interface InvoiceFilters {
	search?: string;
	status?: InvoiceStatus;
	projectId?: number;
	dateFrom?: string;
	dateTo?: string;
	page?: number;
	perPage?: number;
}

export interface InvoiceTotals {
	totalAmount: number;
	paidAmount: number;
	outstandingAmount: number;
	overdueAmount: number;
	invoiceCount: number;
	paidCount: number;
	overdueCount: number;
	currency: CurrencyCode | string;
	hasMixedCurrencies: boolean;
}
