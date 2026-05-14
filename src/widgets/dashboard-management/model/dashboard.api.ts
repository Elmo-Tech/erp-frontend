"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export interface PermissionDashboardOverview {
	financial?: {
		total_invoices: number;
		total_projects: number;
		invoiced_total: number;
		paid_total: number;
		overdue_total: number;
		paid_this_month: number;
		project_budget_total: number;
	};
	timeline?: Array<{
		project_id: number;
		title: string;
		status: string;
		deadline?: string | null;
		total_tasks: number;
		completed_tasks: number;
		progress: number;
	}>;
	team?: {
		members: number;
		hours_this_month: number;
		tasks: {
			total: number;
			todo: number;
			in_progress: number;
			review: number;
			testing: number;
			completed: number;
		};
	};
	personal_tasks?: {
		summary: {
			total: number;
			todo: number;
			in_progress: number;
			review: number;
			testing: number;
			completed: number;
		};
		items: Array<{
			task_id: number;
			title: string;
			status: string;
			priority?: string | null;
			due_date?: string | null;
			project?: string | null;
		}>;
	};
	blockers?: Array<{
		task_id: number;
		dependency_id?: number;
		title: string;
		status: string;
		project?: string | null;
		is_escalated?: boolean;
		escalated_at?: string | null;
		escalated_by?: DashboardPerson | null;
		assignee?: DashboardPerson | null;
		blocked_by: Array<{
			task_id: number;
			dependency_id?: number;
			title: string;
			status: string;
			is_escalated?: boolean;
		}>;
	}>;
	escalated_blockers?: EscalatedBlocker[];
	team_pulse?: TeamPulseItem[];
}

export interface DashboardPerson {
	id: number;
	name?: string | null;
	email?: string | null;
	avatar_url?: string | null;
	points?: number;
}

export interface EscalatedBlocker {
	id: number;
	dependency_id: number;
	task_id: number;
	title?: string | null;
	status?: string | null;
	project?: string | null;
	assignee?: DashboardPerson | null;
	blocked_by?: {
		task_id?: number | null;
		title?: string | null;
		status?: string | null;
	} | null;
	escalated_by?: DashboardPerson | null;
	escalated_at?: string | null;
}

export interface TeamPulseItem {
	id: number;
	submitted_at?: string | null;
	focus_items: string[];
	user?: DashboardPerson | null;
	directive?: {
		id: number;
		title: string;
	} | null;
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
	async getOverview(): Promise<PermissionDashboardOverview> {
		const response = await api.get<PermissionDashboardOverview>("/dashboard/overview");
		return response.data;
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

	async escalateBlocker(taskId: number): Promise<EscalatedBlocker> {
		const response = await api.post<ApiEnvelope<EscalatedBlocker> | EscalatedBlocker>(`/dashboard/blockers/${taskId}/escalate`);
		return unwrapData(response.data);
	},

	async resolveEscalatedBlocker(dependencyId: number): Promise<EscalatedBlocker> {
		const response = await api.post<ApiEnvelope<EscalatedBlocker> | EscalatedBlocker>(`/dashboard/escalated-blockers/${dependencyId}/resolve`);
		return unwrapData(response.data);
	},
};

function unwrapData<T>(payload: ApiEnvelope<T> | T): T {
	if (payload && typeof payload === "object" && "data" in payload) {
		return payload.data;
	}

	return payload;
}

export function useDashboardOverview(scope: "main" | "admin" = "main") {
	return useQuery({
		queryKey: ["dashboard-management", scope],
		queryFn: dashboardApi.getOverview,
	});
}

export function useSalesManagerSummary() {
	return useQuery({
		queryKey: ["dashboard-management", "sales-manager"],
		queryFn: dashboardApi.getSalesManagerSummary,
	});
}

export function useEscalateBlocker() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: dashboardApi.escalateBlocker,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["dashboard-management"] });
		},
	});
}

export function useResolveEscalatedBlocker() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: dashboardApi.resolveEscalatedBlocker,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["dashboard-management"] });
		},
	});
}
