/**
 * Admin Audit Logs Hooks
 * TanStack Query hooks for audit log viewing and filtering.
 *
 * Requirements: 17.1-17.6
 */

import { useQuery } from "@tanstack/react-query";
import { auditLogsApi } from "../api/auditLogs";
import { AuditLogListResponse, AuditLogFilters } from "../types";

/**
 * Query keys for consistent cache management
 */
export const auditLogKeys = {
	all: ["auditLogs"] as const,
	lists: () => [...auditLogKeys.all, "list"] as const,
	list: (filters?: AuditLogFilters) => [...auditLogKeys.lists(), filters] as const,
	actionTypes: () => [...auditLogKeys.all, "actionTypes"] as const,
};

/**
 * Hook to fetch audit logs with filtering and pagination
 * Requirement 17.1: Display timestamp, user, action, resource info, IP
 * Requirement 17.2: Support filtering by action type, user, date range
 * Requirement 17.3: Support searching by resource ID
 * Requirement 17.4: Paginate results
 */
export const useAuditLogs = (filters?: AuditLogFilters, enabled = true) => {
	return useQuery<AuditLogListResponse, Error>({
		queryKey: auditLogKeys.list(filters),
		queryFn: () => auditLogsApi.getAll(filters),
		enabled,
		staleTime: 1 * 60 * 1000, // 1 minute - audit logs should be relatively fresh
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
};

/**
 * Hook to fetch available audit log action types for filtering
 * Useful for populating filter dropdowns
 */
export const useAuditLogActionTypes = (enabled = true) => {
	return useQuery<string[], Error>({
		queryKey: auditLogKeys.actionTypes(),
		queryFn: () => auditLogsApi.getActionTypes(),
		enabled,
		staleTime: 30 * 60 * 1000, // 30 minutes - action types rarely change
		gcTime: 60 * 60 * 1000, // 1 hour
	});
};
