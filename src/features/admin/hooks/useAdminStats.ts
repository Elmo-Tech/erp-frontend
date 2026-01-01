/**
 * Admin Statistics Hooks
 * TanStack Query hooks for admin dashboard statistics, profitability,
 * quality metrics, user performance, and attendance analytics.
 *
 * Requirements: 6.1-6.7, 7.1-7.6, 10.1-10.6, 14.1-14.6, 18.1
 */

import { useQuery } from "@tanstack/react-query";
import { adminStatsApi } from "../api/adminStats";
import { AdminOverviewStats, ProfitabilityReportResponse, ProfitabilityFilters, QualityMetrics, QualityFilters, UserPerformanceResponse, UserPerformanceFilters, AttendanceAnalytics, AttendanceFilters } from "../types";

/**
 * Query keys for consistent cache management
 */
export const adminStatsKeys = {
	all: ["adminStats"] as const,
	overview: () => [...adminStatsKeys.all, "overview"] as const,
	profitability: () => [...adminStatsKeys.all, "profitability"] as const,
	profitabilityList: (filters?: ProfitabilityFilters) => [...adminStatsKeys.profitability(), filters] as const,
	quality: () => [...adminStatsKeys.all, "quality"] as const,
	qualityData: (filters?: QualityFilters) => [...adminStatsKeys.quality(), filters] as const,
	userPerformance: () => [...adminStatsKeys.all, "userPerformance"] as const,
	userPerformanceData: (filters?: UserPerformanceFilters) => [...adminStatsKeys.userPerformance(), filters] as const,
	attendance: () => [...adminStatsKeys.all, "attendance"] as const,
	attendanceData: (filters?: AttendanceFilters) => [...adminStatsKeys.attendance(), filters] as const,
};

/**
 * Hook to fetch admin dashboard overview statistics
 * Requirement 6.4: GET /api/v1/admin/stats/overview endpoint
 * Requirement 14.1-14.5: Dashboard summary statistics
 */
export const useAdminOverview = (enabled = true) => {
	return useQuery<AdminOverviewStats, Error>({
		queryKey: adminStatsKeys.overview(),
		queryFn: () => adminStatsApi.getOverview(),
		enabled,
		staleTime: 2 * 60 * 1000, // 2 minutes - dashboard data should be relatively fresh
		gcTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes (Requirement 14.6)
	});
};

/**
 * Hook to fetch project profitability report
 * Requirement 6.1: GET /api/v1/admin/stats/profitability endpoint
 * Requirement 6.7: Requires view_internal_costs permission
 * Requirement 7.1-7.6: Profitability report with filtering and sorting
 */
export const useProfitability = (filters?: ProfitabilityFilters, enabled = true) => {
	return useQuery<ProfitabilityReportResponse, Error>({
		queryKey: adminStatsKeys.profitabilityList(filters),
		queryFn: () => adminStatsApi.getProfitability(filters),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to fetch quality metrics including bounce rates
 * Requirement 6.2: GET /api/v1/admin/stats/quality endpoint
 * Requirement 15.1-15.6: Quality dashboard data
 */
export const useQualityMetrics = (filters?: QualityFilters, enabled = true) => {
	return useQuery<QualityMetrics, Error>({
		queryKey: adminStatsKeys.qualityData(filters),
		queryFn: () => adminStatsApi.getQuality(filters),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to fetch user performance metrics
 * Requirement 6.3: GET /api/v1/admin/stats/user-performance endpoint
 * Requirement 13.1-13.5: User performance data
 */
export const useUserPerformance = (filters?: UserPerformanceFilters, enabled = true) => {
	return useQuery<UserPerformanceResponse, Error>({
		queryKey: adminStatsKeys.userPerformanceData(filters),
		queryFn: () => adminStatsApi.getUserPerformance(filters),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to fetch attendance analytics
 * Requirement 6.5: GET /api/v1/admin/stats/attendance endpoint
 * Requirement 10.1-10.6: Attendance analytics data
 */
export const useAttendanceAnalytics = (filters?: AttendanceFilters, enabled = true) => {
	return useQuery<AttendanceAnalytics, Error>({
		queryKey: adminStatsKeys.attendanceData(filters),
		queryFn: () => adminStatsApi.getAttendance(filters),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};
