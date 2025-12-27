import api from "@/lib/axios";
import { Quotation, CreateQuotationPayload, UpdateQuotationPayload, CalculatePricingPayload, PricingBreakdown, QuotationListResponse, QuotationFilters } from "../types/quotation";

/**
 * API functions for quotation management
 * Implements requirements 7.1-7.6: Quotation API endpoints
 */
export const quotationsApi = {
	/**
	 * Get all quotations with optional filtering and pagination
	 * Requirement 7.1: GET /api/v1/quotations endpoint to list all quotations with pagination
	 * Requirement 7.7: Support filtering quotations by status and lead_id
	 */
	getAll: async (filters?: QuotationFilters): Promise<QuotationListResponse> => {
		const params = new URLSearchParams();

		if (filters?.search) {
			params.append("filter[search]", filters.search);
		}
		if (filters?.status) {
			params.append("filter[status]", filters.status);
		}
		if (filters?.leadId) {
			params.append("filter[leadId]", filters.leadId.toString());
		}
		if (filters?.page) {
			params.append("page", filters.page.toString());
		}
		if (filters?.perPage) {
			params.append("perPage", filters.perPage.toString());
		}

		const response = await api.get<{ data: QuotationListResponse }>(`/quotations?${params.toString()}`);
		return response.data.data;
	},

	/**
	 * Get a single quotation by ID with calculated pricing
	 * Requirement 7.2: GET /api/v1/quotations/{id} endpoint to retrieve a single quotation with calculated pricing
	 */
	getById: async (id: number): Promise<Quotation> => {
		const response = await api.get<{ data: Quotation }>(`/quotations/${id}`);
		return response.data.data;
	},

	/**
	 * Create a new quotation
	 * Requirement 7.3: POST /api/v1/quotations endpoint to create a new quotation
	 */
	create: async (payload: CreateQuotationPayload): Promise<Quotation> => {
		const response = await api.post<{ data: Quotation }>("/quotations", payload);
		return response.data.data;
	},

	/**
	 * Update an existing quotation
	 * Requirement 7.4: PUT /api/v1/quotations/{id} endpoint to update an existing quotation
	 */
	update: async (id: number, payload: UpdateQuotationPayload): Promise<Quotation> => {
		const response = await api.put<{ data: Quotation }>(`/quotations/${id}`, payload);
		return response.data.data;
	},

	/**
	 * Delete a quotation
	 * Requirement 7.5: DELETE /api/v1/quotations/{id} endpoint to delete a quotation
	 */
	delete: async (id: number): Promise<void> => {
		await api.delete(`/quotations/${id}`);
	},

	/**
	 * Calculate pricing without saving (preview)
	 * Requirement 7.6: POST /api/v1/quotations/calculate endpoint to preview pricing without saving
	 */
	calculatePricing: async (payload: CalculatePricingPayload): Promise<PricingBreakdown> => {
		const response = await api.post<{ data: PricingBreakdown }>("/quotations/calculate", payload);
		return response.data.data;
	},
};
