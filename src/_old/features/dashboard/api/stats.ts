/**
 * Dashboard Stats API
 * API functions for dashboard statistics
 */

import api from "@/shared/api/base";
import { DashboardOverviewResponse } from "../types";

export const dashboardStatsApi = {
	/**
	 * Get dashboard overview stats
	 * GET /api/v1/dashboard/overview
	 */
	getOverview: async (): Promise<DashboardOverviewResponse> => {
		const response = await api.get<DashboardOverviewResponse>("/dashboard/overview");
		return response.data;
	},
};
