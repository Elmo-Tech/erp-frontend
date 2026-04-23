/**
 * Admin Statistics API
 * API functions for admin dashboard statistics, profitability, quality metrics,
 * user performance, and attendance analytics.
 *
 * Requirements: 6.1-6.7, 7.1-7.6, 10.1-10.6, 14.1-14.6
 */

import api from "@/shared/api/base";
import { AdminOverviewStats, ProfitabilityReportResponse, ProfitabilityFilters, QualityMetrics, QualityFilters, UserPerformanceResponse, UserPerformanceFilters, AttendanceAnalytics, AttendanceFilters } from "../types";

/**
 * API functions for admin statistics operations
 * All endpoints require view_admin_stats permission
 */
export const adminStatsApi = {
	/**
	 * Get admin dashboard overview statistics
	 * Requirement 6.4: GET /api/v1/admin/stats/overview endpoint for dashboard summary
	 * Requirement 14.1-14.5: Dashboard summary statistics
	 */
	getOverview: async (): Promise<AdminOverviewStats> => {
		interface BackendOverviewResponse {
			profitability: {
				totalRevenue: string;
				totalProfit: string;
				overallMargin: string;
				activeProjects: number;
				completedProjects: number;
			};
			quality: {
				overallBounceRate: string;
				qualityScore: string;
				totalBounces: number;
				tasksWithBounces: number;
			};
			attendance: {
				totalLateMinutes: number;
				averageIdleTime: string;
				usersWithExcessiveIdle: unknown[];
			};
		}

		const response = await api.get<{ data: BackendOverviewResponse }>("/admin/stats/overview");
		const data = response.data.data;

		// Transform nested backend response to flat frontend structure
		return {
			totalRevenue: parseFloat(data.profitability?.totalRevenue || "0"),
			totalProfit: parseFloat(data.profitability?.totalProfit || "0"),
			overallMargin: parseFloat(data.profitability?.overallMargin || "0"),
			activeProjects: data.profitability?.activeProjects || 0,
			completedProjects: data.profitability?.completedProjects || 0,
			teamUtilization: 100 - parseFloat(data.attendance?.averageIdleTime || "0"), // Calculate utilization from idle time
			qualityScore: parseFloat(data.quality?.qualityScore || "0") / 10, // Convert to 0-10 scale
		};
	},

	/**
	 * Get project profitability report with filtering and pagination
	 * Requirement 6.1: GET /api/v1/admin/stats/profitability endpoint
	 * Requirement 6.7: Requires view_internal_costs permission
	 * Requirement 7.1-7.6: Profitability report with filtering and sorting
	 */
	getProfitability: async (filters?: ProfitabilityFilters): Promise<ProfitabilityReportResponse> => {
		const params = new URLSearchParams();

		if (filters?.status) {
			params.append("status", filters.status);
		}
		if (filters?.dateFrom) {
			params.append("dateFrom", filters.dateFrom);
		}
		if (filters?.dateTo) {
			params.append("dateTo", filters.dateTo);
		}
		if (filters?.sortBy) {
			params.append("sortBy", filters.sortBy);
		}
		if (filters?.sortDirection) {
			params.append("sortDirection", filters.sortDirection);
		}
		if (filters?.page) {
			params.append("page", filters.page.toString());
		}
		if (filters?.perPage) {
			params.append("perPage", filters.perPage.toString());
		}

		const queryString = params.toString();
		const url = queryString ? `/admin/stats/profitability?${queryString}` : "/admin/stats/profitability";

		const response = await api.get<{ data: ProfitabilityReportResponse }>(url);
		return response.data.data;
	},

	/**
	 * Get quality metrics including bounce rates
	 * Requirement 6.2: GET /api/v1/admin/stats/quality endpoint
	 * Requirement 15.1-15.6: Quality dashboard data
	 */
	getQuality: async (filters?: QualityFilters): Promise<QualityMetrics> => {
		const params = new URLSearchParams();

		if (filters?.dateFrom) {
			params.append("dateFrom", filters.dateFrom);
		}
		if (filters?.dateTo) {
			params.append("dateTo", filters.dateTo);
		}
		if (filters?.projectId) {
			params.append("projectId", filters.projectId.toString());
		}

		const queryString = params.toString();
		const url = queryString ? `/admin/stats/quality?${queryString}` : "/admin/stats/quality";

		const response = await api.get<{ data: QualityMetrics }>(url);
		return response.data.data;
	},

	/**
	 * Get user performance metrics
	 * Requirement 6.3: GET /api/v1/admin/stats/user-performance endpoint
	 * Requirement 13.1-13.5: User performance data
	 */
	getUserPerformance: async (filters?: UserPerformanceFilters): Promise<UserPerformanceResponse> => {
		const params = new URLSearchParams();

		if (filters?.dateFrom) {
			params.append("dateFrom", filters.dateFrom);
		}
		if (filters?.dateTo) {
			params.append("dateTo", filters.dateTo);
		}
		if (filters?.userId) {
			params.append("userId", filters.userId.toString());
		}
		if (filters?.aggregateBy) {
			params.append("aggregateBy", filters.aggregateBy);
		}

		const queryString = params.toString();
		const url = queryString ? `/admin/stats/user-performance?${queryString}` : "/admin/stats/user-performance";

		const response = await api.get<{ data: UserPerformanceResponse }>(url);
		return response.data.data;
	},

	/**
	 * Get attendance analytics
	 * Requirement 6.5: GET /api/v1/admin/stats/attendance endpoint
	 * Requirement 10.1-10.6: Attendance analytics data
	 */
	getAttendance: async (filters?: AttendanceFilters): Promise<AttendanceAnalytics> => {
		const params = new URLSearchParams();

		if (filters?.dateFrom) {
			params.append("dateFrom", filters.dateFrom);
		}
		if (filters?.dateTo) {
			params.append("dateTo", filters.dateTo);
		}
		if (filters?.userId) {
			params.append("userId", filters.userId.toString());
		}

		const queryString = params.toString();
		const url = queryString ? `/admin/stats/attendance?${queryString}` : "/admin/stats/attendance";

		const response = await api.get<{ data: AttendanceAnalytics }>(url);
		return response.data.data;
	},
};
