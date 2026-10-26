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
		staleTime: 15_000,
		refetchInterval: 30_000,
	});
};
