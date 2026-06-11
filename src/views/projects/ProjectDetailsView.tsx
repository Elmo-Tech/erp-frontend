"use client";

/**
 * ProjectDetailsView
 *
 * Full-page view for a single project. Rendered by the `/projects/[id]` route.
 *
 * Layout:
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │  Header: Back · Project Title · Client Name · Status Badge   │
 *  │  Progress Bar (overall project progress)                     │
 *  ├──────────────────────────────────────────────────────────────┤
 *  │  Tabs: Overview | Tasks | Meetings | Team | Files |          │
 *  │        Change Requests | Activity                            │
 *  └──────────────────────────────────────────────────────────────┘
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Progress } from "@/shared/ui/progress";
import { projectApi } from "@/entities/project/api/project.api";
import { projectKeys } from "@/entities/project/model/query-keys";
import { ProjectStatusBadge } from "@/entities/project/ui/ProjectStatusBadge";
import { UpdateProjectForm } from "@/features/projects/ui/UpdateProjectForm";
import { useProjectPermissions } from "@/entities/user/model/permissions";
import { ProjectOverviewTab } from "./tabs/ProjectOverviewTab";
import { ProjectTasksTab } from "./tabs/ProjectTasksTab";
import { ProjectMeetingsTab } from "./tabs/ProjectMeetingsTab";
import { ProjectTeamTab } from "./tabs/ProjectTeamTab";
import { ProjectFilesTab } from "./tabs/ProjectFilesTab";
import { ProjectChangeRequestsTab } from "./tabs/ProjectChangeRequestsTab";
import { ProjectActivityTab } from "./tabs/ProjectActivityTab";
import { ProjectNotesTab } from "./tabs/ProjectNotesTab";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectDetailsViewProps {
	projectId: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProjectDetailsView({ projectId }: ProjectDetailsViewProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const initialTaskId = Number(searchParams.get("taskId") ?? 0) || null;
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [activeTab, setActiveTab] = useState(initialTaskId ? "tasks" : "overview");
	const { canEditProjects } = useProjectPermissions();


	const projectQuery = useQuery({
		queryKey: projectKeys.detail(projectId),
		queryFn: () => projectApi.getProjectById(projectId),
		enabled: Number.isFinite(projectId) && projectId > 0,
		staleTime: 5 * 60 * 1000,
	});

	// ── Loading state ──────────────────────────────────────────────────────────
	if (projectQuery.isLoading) {
		return <ProjectDetailsSkeleton />;
	}

	// ── Error / not found state ────────────────────────────────────────────────
	if (projectQuery.error || !projectQuery.data) {
		return (
			<section className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-md border px-4 text-center">
				<div className="text-sm font-medium">Project not found</div>
				<div className="text-sm text-muted-foreground">{projectQuery.error?.message ?? "This project record is unavailable."}</div>
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
	const progress = project.progress ?? 0;

	return (
		<section className="flex flex-col gap-6">
			{/* ── Header ──────────────────────────────────────────────────────── */}
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

					<div className="min-w-0 flex-1">
						{/* Title + status badge */}
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="truncate text-2xl font-semibold tracking-tight">{project.title}</h1>
							<ProjectStatusBadge status={project.status} />
						</div>

						{/* Client name */}
						<p className="mt-0.5 truncate text-sm text-muted-foreground">{project.client?.name ?? "No client assigned"}</p>

						{/* Overall progress bar */}
						<div className="mt-3 flex items-center gap-3">
							<Progress
								value={progress}
								className="h-2 w-48 max-w-xs"
								aria-label={`Project progress: ${progress}%`}
							/>
							<span className="text-xs tabular-nums text-muted-foreground">{progress}% complete</span>
						</div>
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

			{/* ── Tabs ────────────────────────────────────────────────────────── */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="flex flex-col gap-4"
			>
				<TabsList className="w-fit">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="tasks">Tasks</TabsTrigger>
					<TabsTrigger value="meetings">Meetings</TabsTrigger>
					<TabsTrigger value="notes">Notes</TabsTrigger>
					<TabsTrigger value="team">Team</TabsTrigger>
					<TabsTrigger value="files">Files</TabsTrigger>
					<TabsTrigger value="change-requests">Change Requests</TabsTrigger>
					<TabsTrigger value="activity">Activity</TabsTrigger>
				</TabsList>

				<TabsContent value="overview">
					<ProjectOverviewTab project={project} />
				</TabsContent>

				<TabsContent value="tasks">
					<ProjectTasksTab
						projectId={projectId}
						initialTaskId={initialTaskId}
					/>
				</TabsContent>

				<TabsContent value="meetings">
					<ProjectMeetingsTab
						projectId={projectId}
						clientId={project.clientId}
					/>
				</TabsContent>

				<TabsContent value="notes">
					<ProjectNotesTab projectId={projectId} />
				</TabsContent>

				<TabsContent value="team">
					<ProjectTeamTab projectId={projectId} />
				</TabsContent>

				<TabsContent value="files">
					<ProjectFilesTab projectId={projectId} />
				</TabsContent>

				<TabsContent value="change-requests">
					<ProjectChangeRequestsTab
						projectId={projectId}
						currency={project.currency ?? "USD"}
					/>
				</TabsContent>

				<TabsContent value="activity">
					<ProjectActivityTab projectId={projectId} />
				</TabsContent>
			</Tabs>

			{/* ── Edit dialog ─────────────────────────────────────────────────── */}
			<UpdateProjectForm
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				project={project}
			/>
		</section>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function ProjectDetailsSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-start gap-3">
				<Skeleton className="size-8 shrink-0" />
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<Skeleton className="h-7 w-64" />
						<Skeleton className="h-5 w-20" />
					</div>
					<Skeleton className="h-4 w-40" />
					<Skeleton className="mt-1 h-2 w-48" />
				</div>
			</div>
			<Skeleton className="h-10 w-full max-w-2xl" />
			<Skeleton className="h-72 w-full" />
		</div>
	);
}
