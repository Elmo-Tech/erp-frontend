"use client";

import { AlertCircle, BriefcaseBusiness, CalendarClock, CheckCircle2, CircleDollarSign, Timer, Users } from "lucide-react";
import type { PermissionDashboardOverview } from "@/widgets/dashboard-management/model/dashboard.api";
import { Card, CardContent } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { cn } from "@/shared/lib/utils";

type Financial = NonNullable<PermissionDashboardOverview["financial"]>;
type Timeline = NonNullable<PermissionDashboardOverview["timeline"]>;
type Team = NonNullable<PermissionDashboardOverview["team"]>;
type PersonalTasks = NonNullable<PermissionDashboardOverview["personal_tasks"]>;
type Blockers = NonNullable<PermissionDashboardOverview["blockers"]>;

const moneyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0,
});

export function ExecutiveStatsWidget({ financial }: { financial?: Financial }) {
	const metrics = [
		{ label: "Paid this month", value: moneyFormatter.format(financial?.paid_this_month ?? 0), icon: CircleDollarSign },
		{ label: "Paid total", value: moneyFormatter.format(financial?.paid_total ?? 0), icon: CheckCircle2 },
		{ label: "Overdue", value: moneyFormatter.format(financial?.overdue_total ?? 0), icon: AlertCircle },
		{ label: "Project budget", value: moneyFormatter.format(financial?.project_budget_total ?? 0), icon: BriefcaseBusiness },
	];

	return (
		<section className="grid gap-3 md:grid-cols-4">
			{metrics.map((metric) => {
				const Icon = metric.icon;

				return (
					<Card
						key={metric.label}
						className="rounded-md py-0 shadow-none"
					>
						<CardContent className="flex items-center justify-between p-4">
							<div className="min-w-0">
								<p className="truncate text-xs text-muted-foreground">{metric.label}</p>
								<p className="truncate text-xl font-semibold tabular-nums">{metric.value}</p>
							</div>
							<Icon className="size-4 shrink-0 text-muted-foreground" />
						</CardContent>
					</Card>
				);
			})}
		</section>
	);
}

export function ProjectTimelineWidget({ timeline = [] }: { timeline?: Timeline }) {
	return (
		<section className="overflow-hidden rounded-md border bg-background">
			<SectionHeader
				title="Project timeline"
				description={`${timeline.length} active timeline items`}
			/>
			<div className="divide-y">
				{timeline.length ? (
					timeline.slice(0, 6).map((project) => (
						<div
							key={project.project_id}
							className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_160px]"
						>
							<div className="min-w-0">
								<div className="flex items-center gap-2">
									<p className="truncate text-sm font-medium">{project.title}</p>
									<span className="rounded-sm border px-1.5 py-0.5 text-[11px] text-muted-foreground">{project.status.replaceAll("_", " ")}</span>
								</div>
								<div className="mt-2 flex items-center gap-2">
									<Progress
										value={project.progress}
										className="h-1.5"
									/>
									<span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{project.progress}%</span>
								</div>
							</div>
							<div className="flex items-center gap-2 text-xs text-muted-foreground md:justify-end">
								<CalendarClock className="size-3.5" />
								<span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline"}</span>
							</div>
						</div>
					))
				) : (
					<EmptyPanel message="No project timeline data." />
				)}
			</div>
		</section>
	);
}

export function TeamPerformanceWidget({ team }: { team?: Team }) {
	const tasks = team?.tasks;
	const stats = [
		{ label: "Members", value: team?.members ?? 0, icon: Users },
		{ label: "Hours this month", value: team?.hours_this_month ?? 0, icon: Timer },
		{ label: "Open tasks", value: (tasks?.todo ?? 0) + (tasks?.in_progress ?? 0) + (tasks?.review ?? 0) + (tasks?.testing ?? 0), icon: BriefcaseBusiness },
		{ label: "Completed", value: tasks?.completed ?? 0, icon: CheckCircle2 },
	];

	return (
		<section className="overflow-hidden rounded-md border bg-background">
			<SectionHeader
				title="Team performance"
				description={`${tasks?.total ?? 0} tracked tasks`}
			/>
			<div className="grid divide-y md:grid-cols-4 md:divide-x md:divide-y-0">
				{stats.map((stat) => {
					const Icon = stat.icon;

					return (
						<div
							key={stat.label}
							className="flex items-center justify-between gap-3 p-4"
						>
							<div>
								<p className="text-xs text-muted-foreground">{stat.label}</p>
								<p className="text-xl font-semibold tabular-nums">{stat.value}</p>
							</div>
							<Icon className="size-4 text-muted-foreground" />
						</div>
					);
				})}
			</div>
		</section>
	);
}

export function PersonalTasksDashboardWidget({ personalTasks, blockers = [] }: { personalTasks?: PersonalTasks; blockers?: Blockers }) {
	const tasks = personalTasks?.items ?? [];

	return (
		<section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
			<div className="overflow-hidden rounded-md border bg-background">
				<SectionHeader
					title="Personal tasks"
					description={`${personalTasks?.summary.total ?? 0} assigned tasks`}
				/>
				<div className="divide-y">
					{tasks.length ? (
						tasks.slice(0, 8).map((task) => (
							<div
								key={task.task_id}
								className="flex items-center justify-between gap-3 px-4 py-3"
							>
								<div className="min-w-0">
									<p className="truncate text-sm font-medium">{task.title}</p>
									<p className="truncate text-xs text-muted-foreground">{task.project || "No project"}</p>
								</div>
								<span className="shrink-0 rounded-sm border px-1.5 py-0.5 text-[11px] text-muted-foreground">{task.status.replaceAll("_", " ")}</span>
							</div>
						))
					) : (
						<EmptyPanel message="No personal tasks available." />
					)}
				</div>
			</div>

			<div className="overflow-hidden rounded-md border bg-background">
				<SectionHeader
					title="Blockers"
					description={`${blockers.length} blocked tasks`}
				/>
				<div className="divide-y">
					{blockers.length ? (
						blockers.slice(0, 5).map((blocker) => (
							<div
								key={blocker.task_id}
								className="px-4 py-3"
							>
								<p className="truncate text-sm font-medium">{blocker.title}</p>
								<p className="mt-1 text-xs text-muted-foreground">
									Blocked by {blocker.blocked_by.map((task) => task.title).join(", ")}
								</p>
							</div>
						))
					) : (
						<EmptyPanel message="No active blockers." />
					)}
				</div>
			</div>
		</section>
	);
}

function SectionHeader({ title, description, className }: { title: string; description: string; className?: string }) {
	return (
		<div className={cn("border-b px-4 py-3", className)}>
			<h2 className="text-sm font-medium">{title}</h2>
			<p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
		</div>
	);
}

function EmptyPanel({ message }: { message: string }) {
	return <div className="flex min-h-28 items-center justify-center px-4 text-center text-sm text-muted-foreground">{message}</div>;
}
