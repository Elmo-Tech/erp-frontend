"use client";

import { useQuery } from "@tanstack/react-query";
import { qualityApi } from "@/entities/quality/api/quality.api";

export function useQualityMetrics() {
	return useQuery({
		queryKey: ["quality", "metrics"],
		queryFn: qualityApi.getQualityMetrics,
	});
}

export function useCodeReviews(perPage = 8) {
	return useQuery({
		queryKey: ["quality", "code-reviews", perPage],
		queryFn: () => qualityApi.getCodeReviews(perPage),
	});
}

