/**
 * Dashboard Stats Hooks
 * React Query hooks for dashboard statistics
 */

import { useQuery } from "@tanstack/react-query";
import { dashboardStatsApi } from "../api";
import { useAuthStore } from "@/store/authStore";

const DASHBOARD_STATS_KEY = "dashboard-stats";

/**
 * Hook to fetch dashboard overview stats
 */
export const useDashboardStats = () => {
	const { user, role } = useAuthStore();
	return useQuery({
		queryKey: [DASHBOARD_STATS_KEY, user?.userId, role],
		queryFn: dashboardStatsApi.getOverview,
		staleTime: 0,
		refetchOnWindowFocus: true,
	});
};
