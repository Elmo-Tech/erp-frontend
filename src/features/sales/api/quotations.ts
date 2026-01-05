import api from "@/lib/axios";
import { Quotation, QuotationListResponse, CreateQuotationPayload, UpdateQuotationPayload, UpdateStatusPayload, CalculatePricingPayload, PricingBreakdown, QuotationFilters } from "../types";

export const quotationsApi = {
	getAll: async (filters?: QuotationFilters): Promise<QuotationListResponse> => {
		const params = new URLSearchParams();

		if (filters?.search) params.append("filter[search]", filters.search);
		if (filters?.status) params.append("filter[status]", filters.status);
		if (filters?.leadId) params.append("filter[leadId]", filters.leadId.toString());
		if (filters?.expiringIn) params.append("filter[expiringIn]", filters.expiringIn.toString());
		if (filters?.page) params.append("page", filters.page.toString());
		if (filters?.perPage) params.append("perPage", filters.perPage.toString());

		const response = await api.get<{ data: QuotationListResponse }>(`/quotations?${params.toString()}`);
		return response.data.data;
	},

	getById: async (id: number): Promise<Quotation> => {
		const response = await api.get<{ data: Quotation }>(`/quotations/${id}`);
		return response.data.data;
	},

	getExpiring: async (days: number = 3): Promise<QuotationListResponse> => {
		const response = await api.get<{ data: QuotationListResponse }>(`/quotations-expiring?days=${days}`);
		return response.data.data;
	},

	getOverdue: async (): Promise<QuotationListResponse> => {
		const response = await api.get<{ data: QuotationListResponse }>("/quotations-overdue");
		return response.data.data;
	},

	create: async (payload: CreateQuotationPayload): Promise<Quotation> => {
		const response = await api.post<{ data: Quotation }>("/quotations", payload);
		return response.data.data;
	},

	update: async (id: number, payload: UpdateQuotationPayload): Promise<Quotation> => {
		const response = await api.put<{ data: Quotation }>(`/quotations/${id}`, payload);
		return response.data.data;
	},

	updateStatus: async (id: number, payload: UpdateStatusPayload): Promise<Quotation> => {
		const response = await api.patch<{ data: Quotation }>(`/quotations/${id}/status`, payload);
		return response.data.data;
	},

	send: async (id: number): Promise<Quotation> => {
		const response = await api.post<{ data: Quotation }>(`/quotations/${id}/send`);
		return response.data.data;
	},

	delete: async (id: number): Promise<void> => {
		await api.delete(`/quotations/${id}`);
	},

	calculatePricing: async (payload: CalculatePricingPayload): Promise<PricingBreakdown> => {
		const response = await api.post<{ data: PricingBreakdown }>("/quotations/calculate", payload);
		return response.data.data;
	},
};
