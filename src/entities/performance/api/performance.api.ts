import api from "@/shared/api/base";
import type { EmployeeReviewSummary, EvaluationListResponse, EvaluationPeriodListResponse, LeaderboardUser, PeriodBonusSummary } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

export const performanceApi = {
	async getEvaluations(perPage = 15): Promise<EvaluationListResponse> {
		const response = await api.get<ApiEnvelope<EvaluationListResponse>>("/performance/evaluations", {
			params: { perPage },
		});

		return response.data.data;
	},

	async getEvaluationPeriods(perPage = 15): Promise<EvaluationPeriodListResponse> {
		const response = await api.get<ApiEnvelope<EvaluationPeriodListResponse>>("/performance/periods", {
			params: { perPage },
		});

		return response.data.data;
	},

	async getPeriodBonuses(periodId: number): Promise<PeriodBonusSummary> {
		const response = await api.get<ApiEnvelope<PeriodBonusSummary>>(`/performance/periods/${periodId}/bonuses`);

		return response.data.data;
	},

	async getEmployeeReview(userId: number): Promise<EmployeeReviewSummary> {
		const response = await api.get<ApiEnvelope<EmployeeReviewSummary>>(`/admin/stats/employee-review/${userId}`);

		return response.data.data;
	},

	async getPointsLeaderboard(limit = 20): Promise<LeaderboardUser[]> {
		const response = await api.get<ApiEnvelope<LeaderboardUser[]>>(`/user-points/leaderboard?limit=${limit}`);

		return response.data.data;
	},
};
