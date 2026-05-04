"use client";

/**
 * ProjectOverviewTab
 *
 * Dashboard-style overview of a project's key metrics and metadata.
 *
 * Layout:
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │  Stat cards row (4 cols on lg):                              │
 *  │    Progress · Budget · Time Logged · Deadline                │
 *  ├──────────────────────────────────────────────────────────────┤
 *  │  Details panel (2-col grid):                                 │
 *  │    Client · Description · Contract · UI Approved ·           │
 *  │    Estimated Hours · Status                                  │
 *  └──────────────────────────────────────────────────────────────┘
 */

import { Calendar, Clock, DollarSign, FileText, Info, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { ProjectStatusBadge } from "@/entities/project/ui/ProjectStatusBadge";
import { useProjectPermissions } from "@/entities/user/model/permissions";
import { formatDateDisplay } from "@/shared/lib/dateUtils";
import { formatCurrency } from "@/shared/lib/formatters";
import type { Project } from "@/entities/project/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectOverviewTabProps {
	project: Project;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
	label: string;
	value: string;
	icon: LucideIcon;
	sub?: string;
	progress?: number;
}

function StatCard({ label, value, icon: Icon, sub, progress }: StatCardProps) {
	return (
		<Card className="gap-3 py-5">
			<CardHeader className="px-5 pb-0">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
					<div className="flex size-8 items-center justify-center rounded-md bg-muted/50">
						<Icon className="size-4 text-muted-foreground" />
					</div>
				</div>
			</CardHeader>
			<CardContent className="px-5">
				<div className="text-2xl font-bold tabular-nums tracking-tight">{value}</div>
				{sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
				{progress !== undefined && (
					<Progress
						value={progress}
						className="mt-2 h-1.5"
						aria-label={`${label}: ${progress}%`}
					/>
				)}
			</CardContent>
		</Card>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatLoggedTime(totalMinutes: number | null | undefined): string {
	if (!totalMinutes) return "0h";
	const h = Math.floor(totalMinutes / 60);
	const m = totalMinutes % 60;
	if (h === 0) return `${m}m`;
	if (m === 0) return `${h}h`;
	return `${h}h ${m}m`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
	const { canViewProjectBudget } = useProjectPermissions();

	const progress = project.progress ?? 0;

	// ── Stat cards ────────────────────────────────────────────────────────────
	const stats: StatCardProps[] = [
		{
			label: "Overall Progress",
			value: `${Math.round(progress)}%`,
			icon: TrendingUp,
			sub: "Based on completed tasks",
			progress,
		},
		{
			label: "Budget",
			value: canViewProjectBudget ? formatCurrency(project.budget ?? 0, project.currency ?? "USD") : "Restricted",
			icon: DollarSign,
			sub: canViewProjectBudget ? (project.currency ?? "USD") : "No budget access",
		},
		{
			label: "Time Logged",
			value: formatLoggedTime(project.totalTimeSpent),
			icon: Clock,
			sub: project.estimatedHours ? `of ${project.estimatedHours}h estimated` : "No estimate set",
		},
		{
			label: "Deadline",
			value: formatDateDisplay(project.deadline),
			icon: Calendar,
			sub: project.deadline ? "Target completion date" : "No deadline set",
		},
	];

	// ── Detail rows ───────────────────────────────────────────────────────────
	const details: { label: string; icon: LucideIcon; value: React.ReactNode }[] = [
		{
			label: "Client",
			icon: Info,
			value: project.client?.name ?? "No client assigned",
		},
		{
			label: "Status",
			icon: TrendingUp,
			value: <ProjectStatusBadge status={project.status} />,
		},
		{
			label: "Description",
			icon: FileText,
			value: project.description ?? "No description provided",
		},
		{
			label: "Contract",
			icon: FileText,
			value: project.contract?.contractNumber ?? "No contract linked",
		},
		{
			label: "Estimated hours",
			icon: Clock,
			value: project.estimatedHours ? `${project.estimatedHours}h` : "Not set",
		},
		{
			label: "UI approved",
			icon: Calendar,
			value: formatDateDisplay(project.uiApprovedAt),
		},
	];

	return (
		<div className="flex flex-col gap-6">
			{/* ── Stat cards ──────────────────────────────────────────────────── */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<StatCard
						key={stat.label}
						{...stat}
					/>
				))}
			</div>

			{/* ── Details panel ───────────────────────────────────────────────── */}
			<div className="overflow-hidden rounded-md border bg-background">
				<div className="border-b bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Details</div>
				<div className="grid grid-cols-1 md:grid-cols-2">
					{details.map((detail, idx) => {
						const Icon = detail.icon;
						const isLast = idx === details.length - 1;
						return (
							<div
								key={detail.label}
								className={`min-h-14 border-b px-4 py-3 md:border-r md:even:border-r-0 ${isLast ? "border-b-0" : ""}`}
							>
								<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
									<Icon className="size-3" />
									{detail.label}
								</div>
								<div className="mt-1 text-sm font-medium">{detail.value}</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
