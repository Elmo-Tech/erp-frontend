import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary, getPipelineHealth, getTeamPerformance, getBottleneckAnalysis, getAlerts } from "../api/dashboard";
import type { TeamPerformanceParams } from "../types/dashboard";

// Query keys
export const salesDashboardKeys = {
	all: ["sales-dashboard"] as const,
	summary: () => [...salesDashboardKeys.all, "summary"] as const,
	pipeline: () => [...salesDashboardKeys.all, "pipeline"] as const,
	teamPerformance: (params?: TeamPerformanceParams) => [...salesDashboardKeys.all, "team-performance", params] as const,
	bottlenecks: () => [...salesDashboardKeys.all, "bottlenecks"] as const,
	alerts: () => [...salesDashboardKeys.all, "alerts"] as const,
};

/**
 * Hook to fetch dashboard summary
 */
export const useDashboardSummary = () => {
	return useQuery({
		queryKey: salesDashboardKeys.summary(),
		queryFn: getDashboardSummary,
		staleTime: 1000 * 60 * 2, // 2 minutes
		refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
	});
};

/**
 * Hook to fetch pipeline health
 */
export const usePipelineHealth = () => {
	return useQuery({
		queryKey: salesDashboardKeys.pipeline(),
		queryFn: getPipelineHealth,
		staleTime: 1000 * 60 * 2,
	});
};

/**
 * Hook to fetch team performance
 */
export const useTeamPerformance = (params?: TeamPerformanceParams) => {
	return useQuery({
		queryKey: salesDashboardKeys.teamPerformance(params),
		queryFn: () => getTeamPerformance(params),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

/**
 * Hook to fetch bottleneck analysis
 */
export const useBottleneckAnalysis = () => {
	return useQuery({
		queryKey: salesDashboardKeys.bottlenecks(),
		queryFn: getBottleneckAnalysis,
		staleTime: 1000 * 60 * 5,
	});
};

/**
 * Hook to fetch alerts
 */
export const useAlerts = () => {
	return useQuery({
		queryKey: salesDashboardKeys.alerts(),
		queryFn: getAlerts,
		staleTime: 1000 * 60 * 2,
		refetchInterval: 1000 * 60 * 3, // Refetch every 3 minutes for alerts
	});
};
