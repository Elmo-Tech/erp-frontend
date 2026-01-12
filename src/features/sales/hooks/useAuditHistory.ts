import { useQuery } from "@tanstack/react-query";
import { auditApi } from "../api/audit";
import type { AuditHistoryFilters } from "../types/audit";

// Query keys
export const auditKeys = {
	all: ["audit"] as const,
	leadHistory: (leadId: number, filters?: AuditHistoryFilters) => [...auditKeys.all, "lead", leadId, filters] as const,
	leadFullHistory: (leadId: number) => [...auditKeys.all, "lead", leadId, "full"] as const,
	leadStats: (leadId: number) => [...auditKeys.all, "lead", leadId, "stats"] as const,
	proposalHistory: (proposalId: number, filters?: AuditHistoryFilters) => [...auditKeys.all, "proposal", proposalId, filters] as const,
	quotationHistory: (quotationId: number, filters?: AuditHistoryFilters) => [...auditKeys.all, "quotation", quotationId, filters] as const,
	recentActivity: (limit: number) => [...auditKeys.all, "recent", limit] as const,
	userActivity: (userId: number) => [...auditKeys.all, "user", userId] as const,
};

// Lead history hooks
export function useLeadHistory(leadId: number, filters?: AuditHistoryFilters) {
	return useQuery({
		queryKey: auditKeys.leadHistory(leadId, filters),
		queryFn: () => auditApi.getLeadHistory(leadId, filters),
		enabled: !!leadId,
	});
}

export function useLeadFullHistory(leadId: number, perPage: number = 50) {
	return useQuery({
		queryKey: auditKeys.leadFullHistory(leadId),
		queryFn: () => auditApi.getLeadFullHistory(leadId, perPage),
		enabled: !!leadId,
	});
}

export function useLeadHistoryStats(leadId: number) {
	return useQuery({
		queryKey: auditKeys.leadStats(leadId),
		queryFn: () => auditApi.getLeadHistoryStats(leadId),
		enabled: !!leadId,
	});
}

// Proposal history hook
export function useProposalHistory(proposalId: number, filters?: AuditHistoryFilters) {
	return useQuery({
		queryKey: auditKeys.proposalHistory(proposalId, filters),
		queryFn: () => auditApi.getProposalHistory(proposalId, filters),
		enabled: !!proposalId,
	});
}

// Quotation history hook
export function useQuotationHistory(quotationId: number, filters?: AuditHistoryFilters) {
	return useQuery({
		queryKey: auditKeys.quotationHistory(quotationId, filters),
		queryFn: () => auditApi.getQuotationHistory(quotationId, filters),
		enabled: !!quotationId,
	});
}

// Recent activity hook
export function useRecentAuditActivity(limit: number = 10) {
	return useQuery({
		queryKey: auditKeys.recentActivity(limit),
		queryFn: () => auditApi.getRecentActivity(limit),
	});
}

// User activity hook
export function useUserAuditActivity(userId: number, perPage: number = 20) {
	return useQuery({
		queryKey: auditKeys.userActivity(userId),
		queryFn: () => auditApi.getUserActivity(userId, perPage),
		enabled: !!userId,
	});
}
