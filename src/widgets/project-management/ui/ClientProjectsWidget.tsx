"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, Plus } from "lucide-react";
import { toast } from "sonner";
import { projectApi } from "@/entities/project/api/project.api";
import { projectKeys } from "@/entities/project/model/query-keys";
import type { Project } from "@/entities/project/model/types";
import { ProjectCard } from "@/entities/project/ui/ProjectCard";
import { useProjectPermissions } from "@/entities/user/model/permissions";
import { useDeleteProject, usePinProject, useUnpinProject } from "@/features/projects/model/use-project-actions";
import { CreateProjectForm } from "@/features/projects/ui/CreateProjectForm";
import { Button } from "@/shared/ui/button";
import { Pagination } from "@/shared/ui/data-display/Pagination";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface ClientProjectsWidgetProps {
	clientId: number;
	clientName?: string;
	className?: string;
}

const DEFAULT_PER_PAGE = 10;

export function ClientProjectsWidget({ clientId, clientName, className }: ClientProjectsWidgetProps) {
	const router = useRouter();
	const [page, setPage] = useState(1);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
	const { canCreateProjects, canDeleteProjects, canViewProjectBudget } = useProjectPermissions();
	const deleteProject = useDeleteProject();
	const pinProject = usePinProject();
	const unpinProject = useUnpinProject();
	const filters = { clientId, page, perPage: DEFAULT_PER_PAGE };

	const projectsQuery = useQuery({
		queryKey: projectKeys.list(filters),
		queryFn: () => projectApi.getProjects(filters),
		staleTime: 5 * 60 * 1000,
	});

	const projects = projectsQuery.data?.projects ?? [];
	const pagination = projectsQuery.data?.pagination;

	const handleView = (project: Project) => {
		router.push(`/dashboard/projects/${project.projectId}`);
	};

	const handleCreateClick = () => {
		if (!canCreateProjects) {
			toast.error("You do not have permission to create projects");
			return;
		}

		setCreateDialogOpen(true);
	};

	const handleTogglePin = async (project: Project) => {
		try {
			if (project.isPinned) {
				await unpinProject.mutateAsync(project.projectId);
				toast.success("Project unpinned");
			} else {
				await pinProject.mutateAsync(project.projectId);
				toast.success("Project pinned");
			}
		} catch {
			toast.error("Failed to update pinned project");
		}
	};

	const handleConfirmDelete = async () => {
		if (!projectToDelete) {
			return;
		}

		try {
			await deleteProject.mutateAsync(projectToDelete.projectId);
			toast.success("Project deleted");
			setProjectToDelete(null);
		} catch {
			toast.error("Failed to delete project");
		}
	};

	return (
		<section className={cn("flex flex-col gap-4", className)}>
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h2 className="text-lg font-semibold tracking-tight">Projects</h2>
					<p className="text-sm text-muted-foreground">
						{pagination ? `${pagination.total} projects linked to this client` : "Loading client projects"}
					</p>
				</div>

				{canCreateProjects && (
					<Button
						size="sm"
						onClick={handleCreateClick}
					>
						<Plus data-icon="inline-start" />
						New project
					</Button>
				)}
			</div>

			<div className="overflow-hidden rounded-md border bg-background">
				<div className="hidden border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[32px_minmax(180px,1.5fr)_minmax(150px,1fr)_120px_120px_100px_40px] md:items-center md:gap-3">
					<span className="sr-only">Pinned</span>
					<span>Project</span>
					<span>Client</span>
					<span>Status</span>
					<span>Budget</span>
					<span>Deadline</span>
					<span className="sr-only">Actions</span>
				</div>

				{projectsQuery.isLoading ? (
					<ClientProjectRowsSkeleton />
				) : projectsQuery.error ? (
					<div className="flex min-h-40 flex-col items-center justify-center gap-1 px-4 text-center">
						<div className="text-sm font-medium">Unable to load projects</div>
						<div className="text-sm text-muted-foreground">{projectsQuery.error.message}</div>
					</div>
				) : projects.length === 0 ? (
					<div className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-center">
						<FolderKanban className="size-6 text-muted-foreground" />
						<div className="flex flex-col gap-1">
							<div className="text-sm font-medium">No projects yet</div>
							<div className="text-sm text-muted-foreground">Create the first project for this client.</div>
						</div>
						{canCreateProjects && (
							<Button
								size="sm"
								variant="outline"
								onClick={handleCreateClick}
							>
								<Plus data-icon="inline-start" />
								New project
							</Button>
						)}
					</div>
				) : (
					projects.map((project) => (
						<ProjectCard
							key={project.projectId}
							project={project}
							canViewBudget={canViewProjectBudget}
							onView={handleView}
							onDelete={canDeleteProjects ? setProjectToDelete : undefined}
							onTogglePin={handleTogglePin}
						/>
					))
				)}
			</div>

			{pagination && pagination.totalPages > 1 && (
				<Pagination
					pagination={pagination}
					onPageChange={setPage}
				/>
			)}

			<CreateProjectForm
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				clientId={clientId}
				clientName={clientName}
			/>

			<ConfirmDialog
				open={Boolean(projectToDelete)}
				onOpenChange={(open) => {
					if (!open) {
						setProjectToDelete(null);
					}
				}}
				title="Delete project"
				description={
					<span>
						Delete <span className="font-medium text-foreground">{projectToDelete?.title}</span>? This action cannot be undone.
					</span>
				}
				confirmLabel="Delete"
				variant="destructive"
				onConfirm={handleConfirmDelete}
				isLoading={deleteProject.isPending}
			/>
		</section>
	);
}

function ClientProjectRowsSkeleton() {
	return (
		<div className="flex flex-col">
			{Array.from({ length: 5 }).map((_, index) => (
				<div
					key={index}
					className="grid min-h-14 grid-cols-1 gap-2 border-b px-3 py-2.5 last:border-b-0 md:grid-cols-[32px_minmax(180px,1.5fr)_minmax(150px,1fr)_120px_120px_100px_40px] md:items-center md:gap-3"
				>
					<Skeleton className="hidden size-8 md:block" />
					<div className="flex flex-col gap-1">
						<Skeleton className="h-4 w-44" />
						<Skeleton className="h-3 w-56" />
					</div>
					<div className="flex flex-col gap-1">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-40" />
					</div>
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-20" />
					<Skeleton className="size-8" />
				</div>
			))}
		</div>
	);
}
