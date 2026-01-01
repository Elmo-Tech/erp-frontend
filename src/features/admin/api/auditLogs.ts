/**
 * Admin Audit Logs API
 * API functions for audit log viewing and filtering.
 *
 * Requirements: 17.1-17.6
 */

import api from "@/lib/axios";
import { AuditLogListResponse, AuditLogFilters } from "../types";

/**
 * API functions for audit log operations
 * All endpoints require view_audit_logs permission
 */
export const auditLogsApi = {
	/**
	 * Get audit logs with filtering and pagination
	 * Requirement 17.1: Display timestamp, user, action, resource info, IP
	 * Requirement 17.2: Support filtering by action type, user, date range
	 * Requirement 17.3: Support searching by resource ID
	 * Requirement 17.4: Paginate results
	 * Requirement 17.6: GET /api/v1/admin/audit-logs endpoint
	 */
	getAll: async (filters?: AuditLogFilters): Promise<AuditLogListResponse> => {
		const params = new URLSearchParams();

		if (filters?.action) {
			params.append("filter[action]", filters.action);
		}
		if (filters?.userId) {
			params.append("filter[userId]", filters.userId.toString());
		}
		if (filters?.dateFrom) {
			params.append("filter[dateFrom]", filters.dateFrom);
		}
		if (filters?.dateTo) {
			params.append("filter[dateTo]", filters.dateTo);
		}
		if (filters?.resourceId) {
			params.append("filter[resourceId]", filters.resourceId.toString());
		}
		if (filters?.page) {
			params.append("page", filters.page.toString());
		}
		if (filters?.perPage) {
			params.append("perPage", filters.perPage.toString());
		}

		const queryString = params.toString();
		const url = queryString ? `/admin/audit-logs?${queryString}` : "/admin/audit-logs";

		const response = await api.get<{ data: AuditLogListResponse }>(url);
		return response.data.data;
	},

	/**
	 * Get available audit log action types for filtering
	 * Useful for populating filter dropdowns
	 */
	getActionTypes: async (): Promise<string[]> => {
		const response = await api.get<{ data: string[] }>("/admin/audit-logs/action-types");
		return response.data.data;
	},
};
