import api from "@/lib/axios";
import type { AuditHistory, AuditHistoryListResponse, AuditHistoryStats, AuditHistoryFilters } from "../types/audit";

export const auditApi = {
	// Get lead history
	getLeadHistory: async (leadId: number, filters?: AuditHistoryFilters) => {
		const response = await api.get<{ data: AuditHistoryListResponse }>(`/leads/${leadId}/history`, {
			params: {
				"filter[actionType]": filters?.actionType,
				"filter[fieldName]": filters?.fieldName,
				page: filters?.page,
				perPage: filters?.perPage,
			},
		});
		return response.data;
	},

	// Get lead full history (including proposals and quotations)
	getLeadFullHistory: async (leadId: number, perPage: number = 50) => {
		const response = await api.get<{ data: AuditHistoryListResponse }>(`/leads/${leadId}/full-history`, {
			params: { perPage },
		});
		return response.data;
	},

	// Get lead history stats
	getLeadHistoryStats: async (leadId: number) => {
		const response = await api.get<{ data: AuditHistoryStats }>(`/leads/${leadId}/history-stats`);
		return response.data;
	},

	// Get proposal history
	getProposalHistory: async (proposalId: number, filters?: AuditHistoryFilters) => {
		const response = await api.get<{ data: AuditHistoryListResponse }>(`/proposals/${proposalId}/history`, {
			params: {
				"filter[actionType]": filters?.actionType,
				"filter[fieldName]": filters?.fieldName,
				page: filters?.page,
				perPage: filters?.perPage,
			},
		});
		return response.data;
	},

	// Get quotation history
	getQuotationHistory: async (quotationId: number, filters?: AuditHistoryFilters) => {
		const response = await api.get<{ data: AuditHistoryListResponse }>(`/quotations/${quotationId}/history`, {
			params: {
				"filter[actionType]": filters?.actionType,
				"filter[fieldName]": filters?.fieldName,
				page: filters?.page,
				perPage: filters?.perPage,
			},
		});
		return response.data;
	},

	// Get recent audit activity
	getRecentActivity: async (limit: number = 10) => {
		const response = await api.get<{ data: AuditHistory[] }>("/audit/recent", {
			params: { limit },
		});
		return response.data;
	},

	// Get user audit activity
	getUserActivity: async (userId: number, perPage: number = 20) => {
		const response = await api.get<{ data: AuditHistoryListResponse }>(`/audit/user/${userId}`, {
			params: { perPage },
		});
		return response.data;
	},
};
