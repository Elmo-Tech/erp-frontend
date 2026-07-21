import type { AuditLogFilters, UserFilters } from "./types";

export const userKeys = {
	all: ["users"] as const,
	lists: () => [...userKeys.all, "list"] as const,
	list: (filters?: UserFilters) => [...userKeys.lists(), filters] as const,
	internalUsers: () => [...userKeys.all, "internal-users"] as const,
	details: () => [...userKeys.all, "detail"] as const,
	detail: (id: number) => [...userKeys.details(), id] as const,
	roles: () => [...userKeys.all, "roles"] as const,
	role: (id: number) => [...userKeys.roles(), id] as const,
	permissions: () => [...userKeys.all, "permissions"] as const,
	auditLogs: (filters?: AuditLogFilters) => [...userKeys.all, "audit-logs", filters] as const,
	auditActions: () => [...userKeys.all, "audit-actions"] as const,
	profiles: () => [...userKeys.all, "profile"] as const,
	profile: (userId?: number) => [...userKeys.profiles(), userId] as const,
};
