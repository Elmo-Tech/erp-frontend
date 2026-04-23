// Re-export enums from centralized statusHelpers
export { InvoiceStatus, InvoiceStatusLabels, InvoiceStatusColors } from "@/shared/lib/statusHelpers";
import { InvoiceStatus } from "@/shared/lib/statusHelpers";

export interface Invoice {
	invoiceId: number;
	projectId: number;
	invoiceNumber: string;
	amount: number;
	currency: string;
	status: InvoiceStatus;
	dueDate: string;
	paidAt: string | null;
	notes: string | null;
	project?: {
		projectId: number;
		title: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface CreateInvoicePayload {
	projectId: number;
	amount: number;
	currency?: string;
	dueDate: string;
	notes?: string;
}

export interface UpdateInvoicePayload {
	amount?: number;
	currency?: string;
	status?: InvoiceStatus;
	dueDate?: string;
	notes?: string;
}

export interface InvoiceListResponse {
	invoices: Invoice[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
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
