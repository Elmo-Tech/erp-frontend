import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api";
import type { CreateEvaluationPeriodRequest, UpdateEvaluationRequest, CreateCodeReviewRequest, CreateInnovationLogRequest } from "../types";

// ============ Query Keys ============
export const performanceKeys = {
	all: ["performance"] as const,
	periods: () => [...performanceKeys.all, "periods"] as const,
	evaluations: (filters?: Record<string, unknown>) => [...performanceKeys.all, "evaluations", filters] as const,
	evaluation: (id: number) => [...performanceKeys.all, "evaluation", id] as const,
	myEvaluations: () => [...performanceKeys.all, "my-evaluations"] as const,
	periodBonuses: (periodId: number) => [...performanceKeys.all, "bonuses", periodId] as const,
	codeReviews: (filters?: Record<string, unknown>) => [...performanceKeys.all, "code-reviews", filters] as const,
	codeReview: (id: number) => [...performanceKeys.all, "code-review", id] as const,
	myPendingReviews: () => [...performanceKeys.all, "my-pending-reviews"] as const,
	myCodeReviewStats: (startDate?: string, endDate?: string) => [...performanceKeys.all, "my-stats", startDate, endDate] as const,
	innovationLogs: (filters?: Record<string, unknown>) => [...performanceKeys.all, "innovation-logs", filters] as const,
	innovationLog: (id: number) => [...performanceKeys.all, "innovation-log", id] as const,
	pendingInnovations: () => [...performanceKeys.all, "pending-innovations"] as const,
	myInnovationSummary: (startDate?: string, endDate?: string) => [...performanceKeys.all, "my-innovation-summary", startDate, endDate] as const,
};

// ============ Evaluation Periods Hooks ============

export const useEvaluationPeriods = (perPage = 15) => {
	return useQuery({
		queryKey: performanceKeys.periods(),
		queryFn: () => api.getEvaluationPeriods(perPage),
	});
};

export const useCreateEvaluationPeriod = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateEvaluationPeriodRequest) => api.createEvaluationPeriod(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: performanceKeys.periods() });
		},
	});
};

export const useActivateEvaluationPeriod = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (periodId: number) => api.activateEvaluationPeriod(periodId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: performanceKeys.periods() });
			queryClient.invalidateQueries({ queryKey: performanceKeys.evaluations() });
		},
	});
};

export const usePeriodBonuses = (periodId: number) => {
	return useQuery({
		queryKey: performanceKeys.periodBonuses(periodId),
		queryFn: () => api.getPeriodBonuses(periodId),
		enabled: !!periodId,
	});
};

// ============ Evaluations Hooks ============

export const useEvaluations = (filters?: { periodId?: number; status?: string; bonusTier?: string; perPage?: number }) => {
	return useQuery({
		queryKey: performanceKeys.evaluations(filters),
		queryFn: () => api.getEvaluations(filters),
	});
};

export const useEvaluation = (id: number) => {
	return useQuery({
		queryKey: performanceKeys.evaluation(id),
		queryFn: () => api.getEvaluation(id),
		enabled: !!id,
	});
};

export const useMyEvaluations = (perPage = 10) => {
	return useQuery({
		queryKey: performanceKeys.myEvaluations(),
		queryFn: () => api.getMyEvaluations(perPage),
	});
};

export const useUpdateEvaluation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateEvaluationRequest }) => api.updateEvaluation(id, payload),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: performanceKeys.evaluation(id) });
			queryClient.invalidateQueries({ queryKey: performanceKeys.evaluations() });
		},
	});
};

export const useCalculateEvaluation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => api.calculateEvaluation(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: performanceKeys.evaluation(id) });
			queryClient.invalidateQueries({ queryKey: performanceKeys.evaluations() });
		},
	});
};

export const useApproveEvaluation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, notes }: { id: number; notes?: string }) => api.approveEvaluation(id, notes),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: performanceKeys.evaluation(id) });
			queryClient.invalidateQueries({ queryKey: performanceKeys.evaluations() });
		},
	});
};

// ============ Code Reviews Hooks ============

export const useCodeReviews = (filters?: { asReviewer?: boolean; asDeveloper?: boolean; status?: string; taskId?: number; perPage?: number }) => {
	return useQuery({
		queryKey: performanceKeys.codeReviews(filters),
		queryFn: () => api.getCodeReviews(filters),
	});
};

export const useCodeReview = (id: number) => {
	return useQuery({
		queryKey: performanceKeys.codeReview(id),
		queryFn: () => api.getCodeReview(id),
		enabled: !!id,
	});
};

export const useCreateCodeReview = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateCodeReviewRequest) => api.createCodeReview(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: performanceKeys.codeReviews() });
		},
	});
};

export const useApproveCodeReview = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => api.approveCodeReview(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: performanceKeys.codeReview(id) });
			queryClient.invalidateQueries({ queryKey: performanceKeys.codeReviews() });
			queryClient.invalidateQueries({ queryKey: performanceKeys.myPendingReviews() });
		},
	});
};

export const useRequestCodeRevision = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, suggestions }: { id: number; suggestions: string }) => api.requestCodeRevision(id, suggestions),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: performanceKeys.codeReview(id) });
			queryClient.invalidateQueries({ queryKey: performanceKeys.codeReviews() });
			queryClient.invalidateQueries({ queryKey: performanceKeys.myPendingReviews() });
		},
	});
};

export const useMyPendingReviews = () => {
	return useQuery({
		queryKey: performanceKeys.myPendingReviews(),
		queryFn: api.getMyPendingReviews,
	});
};

export const useMyCodeReviewStats = (startDate?: string, endDate?: string) => {
	return useQuery({
		queryKey: performanceKeys.myCodeReviewStats(startDate, endDate),
		queryFn: () => api.getMyCodeReviewStats(startDate, endDate),
	});
};

// ============ Innovation Logs Hooks ============

export const useInnovationLogs = (filters?: { userId?: number; category?: string; isVerified?: boolean; impactLevel?: string; perPage?: number }) => {
	return useQuery({
		queryKey: performanceKeys.innovationLogs(filters),
		queryFn: () => api.getInnovationLogs(filters),
	});
};

export const useInnovationLog = (id: number) => {
	return useQuery({
		queryKey: performanceKeys.innovationLog(id),
		queryFn: () => api.getInnovationLog(id),
		enabled: !!id,
	});
};

export const useCreateInnovationLog = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateInnovationLogRequest) => api.createInnovationLog(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: performanceKeys.innovationLogs() });
			queryClient.invalidateQueries({ queryKey: performanceKeys.myInnovationSummary() });
		},
	});
};

export const useVerifyInnovationLog = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => api.verifyInnovationLog(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: performanceKeys.innovationLog(id) });
			queryClient.invalidateQueries({ queryKey: performanceKeys.innovationLogs() });
			queryClient.invalidateQueries({ queryKey: performanceKeys.pendingInnovations() });
		},
	});
};

export const useRejectInnovationLog = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => api.rejectInnovationLog(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: performanceKeys.innovationLog(id) });
			queryClient.invalidateQueries({ queryKey: performanceKeys.innovationLogs() });
			queryClient.invalidateQueries({ queryKey: performanceKeys.pendingInnovations() });
		},
	});
};

export const useDeleteInnovationLog = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => api.deleteInnovationLog(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: performanceKeys.innovationLogs() });
			queryClient.invalidateQueries({ queryKey: performanceKeys.myInnovationSummary() });
		},
	});
};

export const usePendingInnovationLogs = () => {
	return useQuery({
		queryKey: performanceKeys.pendingInnovations(),
		queryFn: api.getPendingInnovationLogs,
	});
};

export const useMyInnovationSummary = (startDate?: string, endDate?: string) => {
	return useQuery({
		queryKey: performanceKeys.myInnovationSummary(startDate, endDate),
		queryFn: () => api.getMyInnovationSummary(startDate, endDate),
	});
};
