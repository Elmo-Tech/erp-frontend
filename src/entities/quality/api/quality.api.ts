import api from "@/shared/api/base";
import type { CodeReviewListResponse, QualityMetrics } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

export const qualityApi = {
	async getQualityMetrics(): Promise<QualityMetrics> {
		const response = await api.get<ApiEnvelope<QualityMetrics>>("/admin/stats/quality");

		return response.data.data;
	},

	async getCodeReviews(perPage = 8): Promise<CodeReviewListResponse> {
		const response = await api.get<ApiEnvelope<CodeReviewListResponse>>("/code-reviews", {
			params: { perPage },
		});

		return response.data.data;
	},
};
