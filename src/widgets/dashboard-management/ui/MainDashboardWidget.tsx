"use client";

import { Activity, BriefcaseBusiness, CheckCircle2, CircleDollarSign, ClipboardList } from "lucide-react";
import { EmployeeAttendanceWidget } from "@/widgets/attendance/ui/EmployeeAttendanceWidget";
import { UserAssignedTasksWidget } from "@/widgets/task-management/ui/UserAssignedTasksWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { useDashboardOverview } from "../model/dashboard.api";

interface MainDashboardWidgetProps {
	scope?: "main" | "admin";
}

export function MainDashboardWidget({ scope = "main" }: MainDashboardWidgetProps) {
	const overviewQuery = useDashboardOverview(scope);
	const overview = overviewQuery.data;
	const metrics = overview?.metrics?.length
		? overview.metrics
		: [
				{ label: "Active projects", value: overview?.activeProjects ?? 0 },
				{ label: "Open tasks", value: overview?.openTasks ?? 0 },
				{ label: "Pending reviews", value: overview?.pendingReviews ?? 0 },
				{ label: "Revenue", value: overview?.revenue ? overview.revenue.toLocaleString() : 0 },
			];

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">{scope === "admin" ? "Admin dashboard" : "Dashboard"}</h1>
				<p className="text-sm text-muted-foreground">High-level operational state and immediate work.</p>
			</div>

			<div className="grid gap-3 md:grid-cols-4">
				{overviewQuery.isLoading ? (
					<>
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-24 w-full" />
					</>
				) : (
					metrics.slice(0, 4).map((metric, index) => <Metric key={`${metric.label}-${index}`} metric={metric} index={index} />)
				)}
			</div>

			<div className="grid gap-4 xl:grid-cols-[1fr_360px]">
				<UserAssignedTasksWidget compact />
				<div className="space-y-4">
					<EmployeeAttendanceWidget compact />
					<RecentActivity activities={overview?.activities ?? []} />
				</div>
			</div>
		</div>
	);
}

function Metric({ metric, index }: { metric: { label: string; value: string | number; delta?: string }; index: number }) {
	const icons = [BriefcaseBusiness, ClipboardList, CheckCircle2, CircleDollarSign];
	const Icon = icons[index % icons.length];

	return (
		<Card>
			<CardContent className="flex items-center justify-between p-4">
				<div className="min-w-0">
					<p className="truncate text-xs text-muted-foreground">{metric.label}</p>
					<p className="truncate text-xl font-semibold tabular-nums">{metric.value}</p>
					{metric.delta && <p className="text-xs text-muted-foreground">{metric.delta}</p>}
				</div>
				<Icon className="size-4 shrink-0 text-muted-foreground" />
			</CardContent>
		</Card>
	);
}

function RecentActivity({ activities }: { activities: Array<{ id: string | number; title: string; description?: string; createdAt?: string }> }) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-sm">
					<Activity className="size-4" />
					Activity
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="divide-y rounded-md border">
					{activities.length ? (
						activities.slice(0, 5).map((activity) => (
							<div key={activity.id} className="px-3 py-2 text-sm">
								<p className="truncate font-medium">{activity.title}</p>
								{activity.description && <p className="truncate text-xs text-muted-foreground">{activity.description}</p>}
							</div>
						))
					) : (
						<p className="px-3 py-6 text-center text-sm text-muted-foreground">No recent activity.</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
