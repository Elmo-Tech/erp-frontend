"use client";

import { useAuthStore } from "@/entities/user/model/auth.store";
import { Skeleton } from "@/shared/ui/skeleton";
import { useDashboardOverview } from "@/widgets/dashboard-management/model/dashboard.api";
import { ExecutiveStatsWidget, PersonalTasksDashboardWidget, ProjectTimelineWidget, TeamPerformanceWidget } from "@/widgets/dashboard-management/ui/DashboardSectionWidgets";
import { StartDayGateWidget } from "@/widgets/sop-management/ui/StartDayGateWidget";

interface MainDashboardWidgetProps {
	scope?: "main" | "admin";
}

export function MainDashboardWidget({ scope = "main" }: MainDashboardWidgetProps) {
	const { hasPermission } = useAuthStore();
	const dashboardQuery = useDashboardOverview(scope);
	const dashboard = dashboardQuery.data;

	const canViewFinancialStats = hasPermission("view_financial_stats");
	const canViewProjectTimeline = hasPermission("view_project_timeline");
	const canViewTeamPerformance = hasPermission("view_team_performance");
	const canViewPersonalTasks = hasPermission("view_personal_tasks");
	const hasAnyDashboardSection = canViewFinancialStats || canViewProjectTimeline || canViewTeamPerformance || canViewPersonalTasks;

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-1 border-b pb-4">
				<h1 className="text-2xl font-semibold tracking-tight">{scope === "admin" ? "Admin dashboard" : "Dashboard"}</h1>
				<p className="text-sm text-muted-foreground">Permission-scoped operational state and immediate work.</p>
			</div>

			<StartDayGateWidget />

			{dashboardQuery.isLoading ? (
				<DashboardSkeleton />
			) : dashboardQuery.error ? (
				<div className="flex min-h-48 items-center justify-center rounded-md border px-4 text-center text-sm text-muted-foreground">Unable to load dashboard data.</div>
			) : hasAnyDashboardSection ? (
				<div className="space-y-4">
					{canViewFinancialStats && <ExecutiveStatsWidget financial={dashboard?.financial} />}
					{canViewProjectTimeline && <ProjectTimelineWidget timeline={dashboard?.timeline} />}
					{canViewTeamPerformance && <TeamPerformanceWidget team={dashboard?.team} />}
					{canViewPersonalTasks && (
						<PersonalTasksDashboardWidget
							personalTasks={dashboard?.personal_tasks}
							blockers={dashboard?.blockers}
						/>
					)}
				</div>
			) : (
				<div className="flex min-h-48 items-center justify-center rounded-md border px-4 text-center text-sm text-muted-foreground">No dashboard sections are enabled for your account.</div>
			)}
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="space-y-4">
			<div className="grid gap-3 md:grid-cols-4">
				<Skeleton className="h-24 w-full rounded-md" />
				<Skeleton className="h-24 w-full rounded-md" />
				<Skeleton className="h-24 w-full rounded-md" />
				<Skeleton className="h-24 w-full rounded-md" />
			</div>
			<Skeleton className="h-72 w-full rounded-md" />
		</div>
	);
}
