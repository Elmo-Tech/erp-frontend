/**
 * Client Portal Invoices API
 * API functions for client invoice management with Black Box principle.
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

import api from "@/lib/axios";
import { ClientInvoice, ClientInvoiceListResponse, ClientInvoiceFilters } from "../types/clientInvoice";

/**
 * API functions for client invoice operations
 * All endpoints automatically apply ClientScope for data isolation
 */
export const clientInvoicesApi = {
	/**
	 * Get all client invoices with optional filtering and pagination
	 * Requirement 8.1: GET /api/v1/client/invoices endpoint to list client's invoices with pagination
	 * Requirement 8.4: Automatically apply ClientScope to filter invoices
	 */
	getAll: async (filters?: ClientInvoiceFilters): Promise<ClientInvoiceListResponse> => {
		const params = new URLSearchParams();

		if (filters?.search) {
			params.append("filter[search]", filters.search);
		}
		if (filters?.status) {
			params.append("filter[status]", filters.status);
		}
		if (filters?.projectId) {
			params.append("filter[projectId]", filters.projectId.toString());
		}
		if (filters?.page) {
			params.append("page", filters.page.toString());
		}
		if (filters?.perPage) {
			params.append("perPage", filters.perPage.toString());
		}

		const queryString = params.toString();
		const url = queryString ? `/client/invoices?${queryString}` : "/client/invoices";

		const response = await api.get<{ data: ClientInvoiceListResponse }>(url);
		return response.data.data;
	},

	/**
	 * Get a single client invoice by ID
	 * Requirement 8.2: GET /api/v1/client/invoices/{id} endpoint to retrieve a single invoice
	 */
	getById: async (id: number): Promise<ClientInvoice> => {
		const response = await api.get<{ data: ClientInvoice }>(`/client/invoices/${id}`);
		return response.data.data;
	},

	/**
	 * Pay an invoice
	 * Requirement 8.3: POST /api/v1/client/invoices/{id}/pay endpoint to mark an invoice as paid
	 * Only payable invoices (sent or overdue status) can be paid
	 */
	pay: async (id: number): Promise<ClientInvoice> => {
		const response = await api.post<{ data: ClientInvoice }>(`/client/invoices/${id}/pay`);
		return response.data.data;
	},
};
