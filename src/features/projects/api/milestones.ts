/**
 * Milestones API
 * API functions for contract milestone management
 */

import api from "@/lib/axios";
import { Milestone, CreateMilestoneInvoicePayload } from "../types/milestone";

export const milestonesApi = {
	/**
	 * Get a single milestone
	 */
	getById: async (id: number): Promise<Milestone> => {
		const response = await api.get<{ data: Milestone }>(`/milestones/${id}`);
		return response.data.data;
	},

	/**
	 * Create invoice from milestone
	 */
	createInvoice: async (id: number, payload?: CreateMilestoneInvoicePayload): Promise<{ invoice: unknown; milestone: Milestone }> => {
		const response = await api.post<{ data: { invoice: unknown; milestone: Milestone } }>(`/milestones/${id}/create-invoice`, payload || {});
		return response.data.data;
	},

	/**
	 * Link existing invoice to milestone
	 */
	linkInvoice: async (id: number, invoiceId: number): Promise<{ milestone: Milestone }> => {
		const response = await api.post<{ data: { milestone: Milestone } }>(`/milestones/${id}/link-invoice`, { invoiceId });
		return response.data.data;
	},

	/**
	 * Mark milestone as paid
	 */
	markPaid: async (id: number, invoiceId?: number): Promise<Milestone> => {
		const response = await api.patch<{ data: Milestone }>(`/milestones/${id}/mark-paid`, { invoiceId });
		return response.data.data;
	},
};
