"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, DollarSign, ListTodo, Pencil, ReceiptText, Users } from "lucide-react";
import { projectApi } from "@/entities/project/api/project.api";
import { projectKeys } from "@/entities/project/model/query-keys";
import type { Project } from "@/entities/project/model/types";
import { ProjectStatusBadge } from "@/entities/project/ui/ProjectStatusBadge";
import { useEmployeePermissions, useInvoicePermissions, useProjectPermissions, useSalesPermissions, useTaskPermissions } from "@/entities/user/model/permissions";
import { UpdateProjectForm } from "@/features/projects/ui/UpdateProjectForm";
import { ProjectInvoicesWidget } from "@/widgets/finance-management/ui/ProjectInvoicesWidget";
import { ProjectTasksKanbanWidget } from "@/widgets/task-management/ui/ProjectTasksKanbanWidget";
import { ProjectTeamWidget } from "@/widgets/team-management/ui/ProjectTeamWidget";
import { ProjectContractsWidget } from "@/widgets/sales-management/ui/ProjectContractsWidget";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { formatDateDisplay } from "@/shared/lib/dateUtils";
import { formatCurrency } from "@/shared/lib/formatters";
import { cn } from "@/shared/lib/utils";

interface ProjectDetailsCompositeProps {
	projectId: number;
	className?: string;
}

export function ProjectDetailsComposite({ projectId, className }: ProjectDetailsCompositeProps) {
	const router = useRouter();
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const { canEditProjects, canViewProjectBudget } = useProjectPermissions();
	const { canManageTasks, canViewTasks } = useTaskPermissions();
	const { canManageInvoices, canViewInvoices } = useInvoicePermissions();
	const { canManageProjectMembers, canViewProjectMembers } = useEmployeePermissions();
	const { canViewContracts } = useSalesPermissions();
	const canAccessTasks = canManageTasks || canViewTasks;
	const canAccessInvoices = canManageInvoices || canViewInvoices;
	const canAccessTeam = canManageProjectMembers || canViewProjectMembers;

	const projectQuery = useQuery({
		queryKey: projectKeys.detail(projectId),
		queryFn: () => projectApi.getProjectById(projectId),
		enabled: Number.isFinite(projectId) && projectId > 0,
		staleTime: 5 * 60 * 1000,
	});

	if (projectQuery.isLoading) {
		return <ProjectDetailsSkeleton />;
	}

	if (projectQuery.error || !projectQuery.data) {
		return (
			<section className={cn("flex min-h-64 flex-col items-center justify-center gap-3 rounded-md border px-4 text-center", className)}>
				<div className="text-sm font-medium">Project not found</div>
				<div className="text-sm text-muted-foreground">{projectQuery.error?.message || "This project record is unavailable."}</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => router.push("/dashboard/projects")}
				>
					<ArrowLeft data-icon="inline-start" />
					Back to projects
				</Button>
			</section>
		);
	}

	const project = projectQuery.data;

	return (
		<section className={cn("flex flex-col gap-6", className)}>
			<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
				<div className="flex min-w-0 items-start gap-3">
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={() => router.push("/dashboard/projects")}
						aria-label="Back to projects"
					>
						<ArrowLeft />
					</Button>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="truncate text-2xl font-semibold tracking-tight">{project.title}</h1>
							<ProjectStatusBadge status={project.status} />
						</div>
						<p className="truncate text-sm text-muted-foreground">{project.client?.name || "No client"} / Created {formatDateDisplay(project.createdAt)}</p>
					</div>
				</div>

				{canEditProjects && (
					<Button
						size="sm"
						onClick={() => setEditDialogOpen(true)}
					>
						<Pencil data-icon="inline-start" />
						Edit project
					</Button>
				)}
			</div>

			<ProjectStats project={project} canViewBudget={canViewProjectBudget} />

			<Tabs
				defaultValue="overview"
				className="flex flex-col gap-4"
			>
				<TabsList className="w-fit">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					{canAccessTasks && (
						<TabsTrigger value="tasks">
							<ListTodo data-icon="inline-start" />
							Tasks
						</TabsTrigger>
					)}
					{canAccessTeam && (
						<TabsTrigger value="team">
							<Users data-icon="inline-start" />
							Team
						</TabsTrigger>
					)}
					{canAccessInvoices && (
						<TabsTrigger value="invoices">
							<ReceiptText data-icon="inline-start" />
							Invoices
						</TabsTrigger>
					)}
					{canViewContracts && (
						<TabsTrigger value="contracts">
							Contracts
						</TabsTrigger>
					)}
				</TabsList>

				<TabsContent value="overview">
					<ProjectOverviewPanel project={project} canViewBudget={canViewProjectBudget} />
				</TabsContent>

				{canAccessTasks && (
					<TabsContent value="tasks">
						<ProjectTasksKanbanWidget
							projectId={projectId}
							projectTitle={project.title}
						/>
					</TabsContent>
				)}

				{canAccessTeam && (
					<TabsContent value="team">
						<ProjectTeamWidget projectId={projectId} />
					</TabsContent>
				)}

				{canAccessInvoices && (
					<TabsContent value="invoices">
						<ProjectInvoicesWidget
							projectId={projectId}
							projectTitle={project.title}
						/>
					</TabsContent>
				)}

				{canViewContracts && (
					<TabsContent value="contracts">
						<ProjectContractsWidget
							projectId={projectId}
							projectTitle={project.title}
						/>
					</TabsContent>
				)}
			</Tabs>

			<UpdateProjectForm
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				project={project}
			/>
		</section>
	);
}

function ProjectStats({ project, canViewBudget }: { project: Project; canViewBudget: boolean }) {
	const stats = [
		{
			label: "Budget",
			value: canViewBudget ? formatCurrency(project.budget || 0, project.currency || "USD") : "Restricted",
			icon: DollarSign,
		},
		{
			label: "Deadline",
			value: formatDateDisplay(project.deadline),
			icon: Calendar,
		},
		{
			label: "Progress",
			value: `${project.progress || 0}%`,
			icon: ListTodo,
		},
		{
			label: "Time spent",
			value: `${Math.floor((project.totalTimeSpent || 0) / 60)}h ${(project.totalTimeSpent || 0) % 60}m`,
			icon: Clock,
		},
	];

	return (
		<div className="grid gap-3 border-y py-3 md:grid-cols-4">
			{stats.map((stat) => {
				const Icon = stat.icon;

				return (
					<div
						key={stat.label}
						className="min-w-0"
					>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Icon />
							{stat.label}
						</div>
						<div className="truncate text-lg font-semibold tracking-tight tabular-nums">{stat.value}</div>
						{stat.label === "Progress" && (
							<Progress
								value={project.progress || 0}
								className="mt-2 h-1.5"
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}

function ProjectOverviewPanel({ project, canViewBudget }: { project: Project; canViewBudget: boolean }) {
	const details = [
		{ label: "Client", value: project.client?.name || "No client assigned" },
		{ label: "Description", value: project.description || "No description" },
		{ label: "Contract", value: project.contract?.contractNumber || "No contract" },
		{ label: "UI approved", value: formatDateDisplay(project.uiApprovedAt) },
		{ label: "Estimated hours", value: project.estimatedHours ? `${project.estimatedHours}h` : "Not set" },
		{ label: "Budget visibility", value: canViewBudget ? "Visible" : "Restricted" },
	];

	return (
		<div className="overflow-hidden rounded-md border bg-background">
			<div className="border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">Project overview</div>
			<div className="grid grid-cols-1 md:grid-cols-2">
				{details.map((detail) => (
					<div
						key={detail.label}
						className="min-h-14 border-b px-3 py-2.5 md:border-r md:even:border-r-0"
					>
						<div className="text-xs text-muted-foreground">{detail.label}</div>
						<div className="text-sm font-medium">{detail.value}</div>
					</div>
				))}
			</div>
		</div>
	);
}

function ProjectDetailsSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center gap-3">
				<Skeleton className="size-8" />
				<div className="flex flex-col gap-2">
					<Skeleton className="h-7 w-64" />
					<Skeleton className="h-4 w-48" />
				</div>
			</div>
			<div className="grid gap-3 md:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton
						key={index}
						className="h-20"
					/>
				))}
			</div>
			<Skeleton className="h-10 w-96" />
			<Skeleton className="h-72 w-full" />
		</div>
	);
}
