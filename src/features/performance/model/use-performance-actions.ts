"use client";

import { useQuery } from "@tanstack/react-query";
import { performanceApi } from "@/entities/performance/api/performance.api";

export const performanceKeys = {
	all: ["performance"] as const,
	evaluations: () => [...performanceKeys.all, "evaluations"] as const,
	periods: () => [...performanceKeys.all, "periods"] as const,
	periodBonuses: (periodId: number) => [...performanceKeys.all, "period-bonuses", periodId] as const,
	employeeReview: (userId?: number) => [...performanceKeys.all, "employee-review", userId] as const,
	leaderboard: () => [...performanceKeys.all, "leaderboard"] as const,
};

export function useEvaluations(perPage = 15) {
	return useQuery({
		queryKey: performanceKeys.evaluations(),
		queryFn: () => performanceApi.getEvaluations(perPage),
	});
}

export function useEvaluationPeriods(perPage = 15) {
	return useQuery({
		queryKey: performanceKeys.periods(),
		queryFn: () => performanceApi.getEvaluationPeriods(perPage),
	});
}

export function usePeriodBonuses(periodId: number) {
	return useQuery({
		queryKey: performanceKeys.periodBonuses(periodId),
		queryFn: () => performanceApi.getPeriodBonuses(periodId),
		enabled: Number.isFinite(periodId) && periodId > 0,
	});
}

export function useEmployeeReview(userId?: number) {
	return useQuery({
		queryKey: performanceKeys.employeeReview(userId),
		queryFn: () => performanceApi.getEmployeeReview(userId as number),
		enabled: Boolean(userId),
	});
}

export function usePointsLeaderboard(limit = 20) {
	return useQuery({
		queryKey: performanceKeys.leaderboard(),
		queryFn: () => performanceApi.getPointsLeaderboard(limit),
	});
}
