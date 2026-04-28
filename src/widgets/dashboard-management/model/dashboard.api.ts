"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/shared/api/base";

interface ApiEnvelope<T> {
	data: T;
}

export interface DashboardMetric {
	label: string;
	value: string | number;
	delta?: string;
}

export interface DashboardActivity {
	id: string | number;
	title: string;
	description?: string;
	createdAt?: string;
}

export interface DashboardOverview {
	role?: string;
	metrics?: DashboardMetric[];
	activities?: DashboardActivity[];
	pendingReviews?: number;
	activeProjects?: number;
	openTasks?: number;
	revenue?: number;
}

export interface SalesManagerSummary {
	metrics?: DashboardMetric[];
	alerts?: DashboardActivity[];
	bottlenecks?: DashboardActivity[];
	teamPerformance?: Array<{
		id: string | number;
		name: string;
		value: number;
		label?: string;
	}>;
}

export const dashboardApi = {
	async getOverview(): Promise<DashboardOverview> {
		const response = await api.get<ApiEnvelope<DashboardOverview>>("/dashboard/overview");
		return response.data.data;
	},

	async getAdminOverview(): Promise<DashboardOverview> {
		const response = await api.get<ApiEnvelope<DashboardOverview>>("/admin/dashboard/overview");
		return response.data.data;
	},

	async getSalesManagerSummary(): Promise<SalesManagerSummary> {
		const [summary, team, bottlenecks, alerts] = await Promise.all([
			api.get<ApiEnvelope<SalesManagerSummary>>("/sales-dashboard/summary"),
			api.get<ApiEnvelope<SalesManagerSummary["teamPerformance"]>>("/sales-dashboard/team-performance"),
			api.get<ApiEnvelope<DashboardActivity[]>>("/sales-dashboard/bottlenecks"),
			api.get<ApiEnvelope<DashboardActivity[]>>("/sales-dashboard/alerts"),
		]);

		return {
			...summary.data.data,
			teamPerformance: team.data.data ?? [],
			bottlenecks: bottlenecks.data.data ?? [],
			alerts: alerts.data.data ?? [],
		};
	},
};

export function useDashboardOverview(scope: "main" | "admin" = "main") {
	return useQuery({
		queryKey: ["dashboard-management", scope],
		queryFn: () => (scope === "admin" ? dashboardApi.getAdminOverview() : dashboardApi.getOverview()),
	});
}

export function useSalesManagerSummary() {
	return useQuery({
		queryKey: ["dashboard-management", "sales-manager"],
		queryFn: dashboardApi.getSalesManagerSummary,
	});
}
