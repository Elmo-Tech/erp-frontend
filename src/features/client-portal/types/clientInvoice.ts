/**
 * Client Portal Invoice Types
 * These types represent the client-facing view of invoices.
 * Internal data (notes, createdBy, updatedBy) is hidden.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 15.1
 */

/**
 * Invoice status enum matching backend InvoiceStatus
 */
export enum InvoiceStatus {
	DRAFT = "draft",
	SENT = "sent",
	PAID = "paid",
	OVERDUE = "overdue",
	CANCELLED = "cancelled",
}

/**
 * Client-facing invoice interface with limited visibility.
 * HIDDEN: notes, createdBy, updatedBy
 */
export interface ClientInvoice {
	invoiceId: number;
	invoiceNumber: string;
	projectId: number;
	amount: number;
	currency: string;
	status: string;
	statusLabel: string;
	dueDate: string;
	paidAt: string;
	isOverdue: boolean;
	isPayable: boolean;
	createdAt: string;
}

/**
 * Pagination metadata for client invoice lists
 */
export interface ClientInvoicePagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

/**
 * Response structure for client invoice list endpoint
 * GET /api/v1/client/invoices
 */
export interface ClientInvoiceListResponse {
	invoices: ClientInvoice[];
	pagination: ClientInvoicePagination;
}

/**
 * Filters for client invoice list queries
 */
export interface ClientInvoiceFilters {
	status?: InvoiceStatus | string;
	projectId?: number;
	search?: string;
	page?: number;
	perPage?: number;
}
