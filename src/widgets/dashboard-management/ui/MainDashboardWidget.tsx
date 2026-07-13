"use client";

import { toast } from "sonner";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { Skeleton } from "@/shared/ui/skeleton";
import { useDashboardOverview, useEscalateBlocker } from "@/widgets/dashboard-management/model/dashboard.api";
import { EscalatedBlockersWidget, ExecutiveStatsWidget, OperationalChartsWidget, PersonalTasksDashboardWidget, ProjectTimelineWidget, TeamDailyPulseWidget, TeamPerformanceWidget } from "@/widgets/dashboard-management/ui/DashboardSectionWidgets";
import { StartDayGateWidget } from "@/widgets/sop-management/ui/StartDayGateWidget";

interface MainDashboardWidgetProps {
	scope?: "main" | "admin";
}

export function MainDashboardWidget({ scope = "main" }: MainDashboardWidgetProps) {
	const { hasPermission } = useAuthStore();
	const dashboardQuery = useDashboardOverview(scope);
	const escalateBlocker = useEscalateBlocker();
	const dashboard = dashboardQuery.data;
	const isAdminScope = scope === "admin";

	const canViewFinancialStats = hasPermission("view_financial_stats");
	const canViewProjectTimeline = hasPermission("view_project_timeline");
	const canViewTeamPerformance = hasPermission("view_team_performance");
	const canViewPersonalTasks = hasPermission("view_personal_tasks");
	const canViewAllBlockers = hasPermission("view_all_blockers");
	const canViewEscalatedBlockers = hasPermission("view_escalated_blockers");
	const canViewTeamPulse = hasPermission("view_team_pulse");
	const hasEscalatedBlockers = Boolean(dashboard?.escalated_blockers?.length);
	const canShowPersonalPanel = !isAdminScope && (canViewPersonalTasks || canViewAllBlockers);
	const canShowGlobalBlockers = isAdminScope && canViewAllBlockers;
	const hasAnyDashboardSection = canViewFinancialStats || canViewProjectTimeline || canViewTeamPerformance || canShowPersonalPanel || canShowGlobalBlockers || canViewEscalatedBlockers || canViewTeamPulse;

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-1 border-b pb-4">
				<h1 className="text-2xl font-semibold tracking-tight">{isAdminScope ? "Company Analytics" : "Dashboard"}</h1>
				<p className="text-sm text-muted-foreground">{isAdminScope ? "Company-wide revenue, project, and team KPIs." : "Permission-scoped operational state and immediate work."}</p>
			</div>

			{!isAdminScope && <StartDayGateWidget />}

			{dashboardQuery.isLoading ? (
				<DashboardSkeleton />
			) : dashboardQuery.error ? (
				<div className="flex min-h-48 items-center justify-center rounded-md border px-4 text-center text-sm text-muted-foreground">Unable to load dashboard data.</div>
			) : hasAnyDashboardSection ? (
				<div className="space-y-4">
					{canViewEscalatedBlockers && hasEscalatedBlockers && <EscalatedBlockersWidget blockers={dashboard?.escalated_blockers} />}
					{canViewFinancialStats && <ExecutiveStatsWidget financial={dashboard?.financial} />}
					{isAdminScope && (canViewFinancialStats || canViewTeamPerformance) && <OperationalChartsWidget financial={canViewFinancialStats ? dashboard?.financial : undefined} team={canViewTeamPerformance ? dashboard?.team : undefined} />}
					{canViewTeamPulse && <TeamDailyPulseWidget pulse={dashboard?.team_pulse} />}
					{canViewProjectTimeline && <ProjectTimelineWidget timeline={dashboard?.timeline} />}
					{canViewTeamPerformance && <TeamPerformanceWidget team={dashboard?.team} />}
					{canShowPersonalPanel && (
						<PersonalTasksDashboardWidget
							personalTasks={dashboard?.personal_tasks}
							blockers={dashboard?.blockers}
							showTasksPanel={canViewPersonalTasks}
							blockersTitle={canViewAllBlockers ? "Active blockers" : "My blockers"}
							onEscalate={canViewAllBlockers ? (blocker) => {
								const taskId = blocker.task_id ?? Number(blocker.id);
								if (!taskId) {
									toast.error("Unable to escalate blocker");
									return;
								}

								escalateBlocker.mutate(Number(taskId), {
									onSuccess: () => toast.success("Blocker escalated to founder"),
									onError: () => toast.error("Failed to escalate blocker"),
								});
							} : undefined}
							escalatingTaskId={escalateBlocker.variables}
						/>
					)}
					{canShowGlobalBlockers && (
						<PersonalTasksDashboardWidget
							blockers={dashboard?.blockers}
							showTasksPanel={false}
							blockersTitle="Active blockers"
							onEscalate={(blocker) => {
								const taskId = blocker.task_id ?? Number(blocker.id);
								if (!taskId) {
									toast.error("Unable to escalate blocker");
									return;
								}

								escalateBlocker.mutate(Number(taskId), {
									onSuccess: () => toast.success("Blocker escalated to founder"),
									onError: () => toast.error("Failed to escalate blocker"),
								});
							}}
							escalatingTaskId={escalateBlocker.variables}
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
