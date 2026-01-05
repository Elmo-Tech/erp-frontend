import { api } from "@/lib/axios";
import type {
	EvaluationPeriod,
	PerformanceEvaluation,
	EvaluationScoreSummary,
	PeriodBonusSummary,
	CodeReview,
	CodeReviewStats,
	InnovationLog,
	InnovationSummary,
	CreateEvaluationPeriodRequest,
	UpdateEvaluationRequest,
	CreateCodeReviewRequest,
	CreateInnovationLogRequest,
} from "../types";

// ============ Evaluation Periods ============

export const getEvaluationPeriods = async (perPage = 15) => {
	const { data } = await api.get<{
		success: boolean;
		data: { periods: EvaluationPeriod[]; pagination: unknown };
	}>("/performance/periods", { params: { perPage } });
	return data.data;
};

export const createEvaluationPeriod = async (payload: CreateEvaluationPeriodRequest) => {
	const { data } = await api.post<{
		success: boolean;
		message: string;
		data: EvaluationPeriod;
	}>("/performance/periods", payload);
	return data;
};

export const activateEvaluationPeriod = async (periodId: number) => {
	const { data } = await api.post<{
		success: boolean;
		message: string;
	}>(`/performance/periods/${periodId}/activate`);
	return data;
};

export const getPeriodBonuses = async (periodId: number) => {
	const { data } = await api.get<{
		success: boolean;
		data: PeriodBonusSummary;
	}>(`/performance/periods/${periodId}/bonuses`);
	return data.data;
};

// ============ Evaluations ============

export const getEvaluations = async (filters?: { periodId?: number; status?: string; bonusTier?: string; perPage?: number }) => {
	const params: Record<string, unknown> = {};
	if (filters?.periodId) params["filter[periodId]"] = filters.periodId;
	if (filters?.status) params["filter[status]"] = filters.status;
	if (filters?.bonusTier) params["filter[bonusTier]"] = filters.bonusTier;
	if (filters?.perPage) params.perPage = filters.perPage;

	const { data } = await api.get<{
		success: boolean;
		data: { evaluations: PerformanceEvaluation[]; pagination: unknown };
	}>("/performance/evaluations", { params });
	return data.data;
};

export const getEvaluation = async (id: number) => {
	const { data } = await api.get<{
		success: boolean;
		data: {
			evaluation: PerformanceEvaluation;
			summary: EvaluationScoreSummary;
		};
	}>(`/performance/evaluations/${id}`);
	return data.data;
};

export const updateEvaluation = async (id: number, payload: UpdateEvaluationRequest) => {
	const { data } = await api.put<{
		success: boolean;
		message: string;
	}>(`/performance/evaluations/${id}`, payload);
	return data;
};

export const calculateEvaluation = async (id: number) => {
	const { data } = await api.post<{
		success: boolean;
		message: string;
	}>(`/performance/evaluations/${id}/calculate`);
	return data;
};

export const approveEvaluation = async (id: number, notes?: string) => {
	const { data } = await api.post<{
		success: boolean;
		message: string;
	}>(`/performance/evaluations/${id}/approve`, { notes });
	return data;
};

export const getMyEvaluations = async (perPage = 10) => {
	const { data } = await api.get<{
		success: boolean;
		data: { evaluations: PerformanceEvaluation[]; pagination: unknown };
	}>("/performance/my-evaluations", { params: { perPage } });
	return data.data;
};

// ============ Code Reviews ============

export const getCodeReviews = async (filters?: { asReviewer?: boolean; asDeveloper?: boolean; status?: string; taskId?: number; perPage?: number }) => {
	const params: Record<string, unknown> = {};
	if (filters?.asReviewer) params["filter[asReviewer]"] = "true";
	if (filters?.asDeveloper) params["filter[asDeveloper]"] = "true";
	if (filters?.status) params["filter[status]"] = filters.status;
	if (filters?.taskId) params["filter[taskId]"] = filters.taskId;
	if (filters?.perPage) params.perPage = filters.perPage;

	const { data } = await api.get<{
		success: boolean;
		data: { codeReviews: CodeReview[]; pagination: unknown };
	}>("/code-reviews", { params });
	return data.data;
};

export const getCodeReview = async (id: number) => {
	const { data } = await api.get<{
		success: boolean;
		data: CodeReview;
	}>(`/code-reviews/${id}`);
	return data.data;
};

export const createCodeReview = async (payload: CreateCodeReviewRequest) => {
	const { data } = await api.post<{
		success: boolean;
		message: string;
		data: CodeReview;
	}>("/code-reviews", payload);
	return data;
};

export const updateCodeReview = async (id: number, payload: Partial<CreateCodeReviewRequest>) => {
	const { data } = await api.put<{
		success: boolean;
		message: string;
	}>(`/code-reviews/${id}`, payload);
	return data;
};

export const approveCodeReview = async (id: number) => {
	const { data } = await api.post<{
		success: boolean;
		message: string;
	}>(`/code-reviews/${id}/approve`);
	return data;
};

export const requestCodeRevision = async (id: number, suggestions: string) => {
	const { data } = await api.post<{
		success: boolean;
		message: string;
	}>(`/code-reviews/${id}/request-revision`, { suggestions });
	return data;
};

export const getMyPendingReviews = async () => {
	const { data } = await api.get<{
		success: boolean;
		data: CodeReview[];
	}>("/code-reviews/my-pending");
	return data.data;
};

export const getMyCodeReviewStats = async (startDate?: string, endDate?: string) => {
	const params: Record<string, string> = {};
	if (startDate) params.startDate = startDate;
	if (endDate) params.endDate = endDate;

	const { data } = await api.get<{
		success: boolean;
		data: CodeReviewStats;
	}>("/code-reviews/my-stats", { params });
	return data.data;
};

// ============ Innovation Logs ============

export const getInnovationLogs = async (filters?: { userId?: number; category?: string; isVerified?: boolean; impactLevel?: string; perPage?: number }) => {
	const params: Record<string, unknown> = {};
	if (filters?.userId) params["filter[userId]"] = filters.userId;
	if (filters?.category) params["filter[category]"] = filters.category;
	if (filters?.isVerified !== undefined) params["filter[isVerified]"] = filters.isVerified ? "true" : "false";
	if (filters?.impactLevel) params["filter[impactLevel]"] = filters.impactLevel;
	if (filters?.perPage) params.perPage = filters.perPage;

	const { data } = await api.get<{
		success: boolean;
		data: { innovationLogs: InnovationLog[]; pagination: unknown };
	}>("/innovation-logs", { params });
	return data.data;
};

export const getInnovationLog = async (id: number) => {
	const { data } = await api.get<{
		success: boolean;
		data: InnovationLog;
	}>(`/innovation-logs/${id}`);
	return data.data;
};

export const createInnovationLog = async (payload: CreateInnovationLogRequest) => {
	const { data } = await api.post<{
		success: boolean;
		message: string;
		data: InnovationLog;
	}>("/innovation-logs", payload);
	return data;
};

export const verifyInnovationLog = async (id: number) => {
	const { data } = await api.post<{
		success: boolean;
		message: string;
	}>(`/innovation-logs/${id}/verify`);
	return data;
};

export const rejectInnovationLog = async (id: number) => {
	const { data } = await api.post<{
		success: boolean;
		message: string;
	}>(`/innovation-logs/${id}/reject`);
	return data;
};

export const deleteInnovationLog = async (id: number) => {
	const { data } = await api.delete<{
		success: boolean;
		message: string;
	}>(`/innovation-logs/${id}`);
	return data;
};

export const getPendingInnovationLogs = async () => {
	const { data } = await api.get<{
		success: boolean;
		data: InnovationLog[];
	}>("/innovation-logs/pending");
	return data.data;
};

export const getMyInnovationSummary = async (startDate?: string, endDate?: string) => {
	const params: Record<string, string> = {};
	if (startDate) params.startDate = startDate;
	if (endDate) params.endDate = endDate;

	const { data } = await api.get<{
		success: boolean;
		data: InnovationSummary;
	}>("/innovation-logs/my-summary", { params });
	return data.data;
};
