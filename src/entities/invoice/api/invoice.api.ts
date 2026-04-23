import api from "@/shared/api/base";
import type { CreateInvoicePayload, Invoice, InvoiceFilters, InvoiceListResponse, UpdateInvoicePayload } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

function buildInvoiceParams(filters?: InvoiceFilters) {
	const params = new URLSearchParams();

	if (filters?.search) {
		params.append("filter[search]", filters.search);
	}

	if (filters?.status) {
		params.append("filter[status]", filters.status);
	}

	if (filters?.projectId) {
		params.append("filter[project_id]", String(filters.projectId));
	}

	if (filters?.dateFrom) {
		params.append("filter[dateFrom]", filters.dateFrom);
	}

	if (filters?.dateTo) {
		params.append("filter[dateTo]", filters.dateTo);
	}

	if (filters?.page) {
		params.append("page", String(filters.page));
	}

	if (filters?.perPage) {
		params.append("perPage", String(filters.perPage));
	}

	return params;
}

function withQuery(path: string, params: URLSearchParams) {
	const query = params.toString();

	return query ? `${path}?${query}` : path;
}

export const invoiceApi = {
	async getInvoices(filters?: InvoiceFilters): Promise<InvoiceListResponse> {
		const response = await api.get<ApiEnvelope<InvoiceListResponse>>(withQuery("/invoices", buildInvoiceParams(filters)));

		return response.data.data;
	},

	async getInvoice(id: number): Promise<Invoice> {
		const response = await api.get<ApiEnvelope<Invoice>>(`/invoices/${id}`);

		return response.data.data;
	},

	async createInvoice(payload: CreateInvoicePayload): Promise<Invoice> {
		const response = await api.post<ApiEnvelope<Invoice>>("/invoices", payload);

		return response.data.data;
	},

	async updateInvoice(id: number, payload: UpdateInvoicePayload): Promise<Invoice> {
		const response = await api.put<ApiEnvelope<Invoice>>(`/invoices/${id}`, payload);

		return response.data.data;
	},

	async markInvoiceAsPaid(id: number): Promise<Invoice> {
		const response = await api.patch<ApiEnvelope<Invoice>>(`/invoices/${id}/mark-paid`);

		return response.data.data;
	},

	async downloadInvoicePdf(id: number): Promise<Blob> {
		const response = await api.get<Blob>(`/invoices/${id}/download`, {
			responseType: "blob",
		});

		return response.data;
	},

	async deleteInvoice(id: number): Promise<void> {
		await api.delete(`/invoices/${id}`);
	},
};
