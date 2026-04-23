import api from "@/shared/api/base";
import { Invoice, CreateInvoicePayload, UpdateInvoicePayload, InvoiceListResponse, InvoiceFilters } from "../types";

export const invoicesApi = {
	getAll: async (filters?: InvoiceFilters): Promise<InvoiceListResponse> => {
		const params = new URLSearchParams();

		if (filters?.search) {
			params.append("filter[search]", filters.search);
		}
		if (filters?.status) {
			params.append("filter[status]", filters.status);
		}
		if (filters?.projectId) {
			params.append("filter[project_id]", filters.projectId.toString());
		}
		if (filters?.dateFrom) {
			params.append("filter[dateFrom]", filters.dateFrom);
		}
		if (filters?.dateTo) {
			params.append("filter[dateTo]", filters.dateTo);
		}
		if (filters?.page) {
			params.append("page", filters.page.toString());
		}
		if (filters?.perPage) {
			params.append("perPage", filters.perPage.toString());
		}

		const response = await api.get<{ data: InvoiceListResponse }>(`/invoices?${params.toString()}`);
		return response.data.data;
	},

	getById: async (id: number): Promise<Invoice> => {
		const response = await api.get<{ data: Invoice }>(`/invoices/${id}`);
		return response.data.data;
	},

	create: async (payload: CreateInvoicePayload): Promise<Invoice> => {
		const response = await api.post<{ data: Invoice }>("/invoices", payload);
		return response.data.data;
	},

	update: async (id: number, payload: UpdateInvoicePayload): Promise<Invoice> => {
		const response = await api.put<{ data: Invoice }>(`/invoices/${id}`, payload);
		return response.data.data;
	},

	markAsPaid: async (id: number): Promise<Invoice> => {
		const response = await api.patch<{ data: Invoice }>(`/invoices/${id}/mark-paid`);
		return response.data.data;
	},

	download: async (id: number): Promise<Blob> => {
		const response = await api.get(`/invoices/${id}/download`, {
			responseType: "blob",
		});
		return response.data;
	},

	delete: async (id: number): Promise<void> => {
		await api.delete(`/invoices/${id}`);
	},
};
