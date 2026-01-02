/**
 * Dashboard Stats Hooks
 * React Query hooks for dashboard statistics
 */

import { useQuery } from "@tanstack/react-query";
import { dashboardStatsApi } from "../api";

const DASHBOARD_STATS_KEY = "dashboard-stats";

/**
 * Hook to fetch dashboard overview stats
 */
export const useDashboardStats = () => {
	return useQuery({
		queryKey: [DASHBOARD_STATS_KEY],
		queryFn: dashboardStatsApi.getOverview,
		staleTime: 2 * 60 * 1000, // 2 minutes
		refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
	});
};
