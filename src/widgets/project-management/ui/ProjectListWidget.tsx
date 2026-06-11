"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { clientApi } from "@/entities/client/api/client.api";
import { clientKeys } from "@/entities/client/model/query-keys";
import { projectApi } from "@/entities/project/api/project.api";
import { projectKeys } from "@/entities/project/model/query-keys";
import type { Project, ProjectFilters } from "@/entities/project/model/types";
import { useProjectPermissions } from "@/entities/user/model/permissions";
import { useDeleteProject, usePinProject, useUnpinProject } from "@/features/projects/model/use-project-actions";
import { CreateProjectForm } from "@/features/projects/ui/CreateProjectForm";
import { DataTable } from "@/shared/ui/data-display/DataTable";
import { ProjectDeleteDialog } from "./ProjectDeleteDialog";
import { ProjectListHeader } from "./ProjectListHeader";
import { ProjectListFilters } from "./ProjectListFilters";
import { ProjectRowActions } from "./ProjectRowActions";
import { buildProjectColumns } from "./project-list-columns";

const DEFAULT_FILTERS: ProjectFilters = {
	page: 1,
	perPage: 15,
};

export function ProjectListWidget() {
	const router = useRouter();
	const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_FILTERS);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
	const { canCreateProjects, canDeleteProjects, canViewProjectBudget } = useProjectPermissions();
	const deleteProject = useDeleteProject();
	const pinProject = usePinProject();
	const unpinProject = useUnpinProject();

	const projectsQuery = useQuery({
		queryKey: projectKeys.list(filters),
		queryFn: () => projectApi.getProjects(filters),
		staleTime: 5 * 60 * 1000,
	});

	const clientsQuery = useQuery({
		queryKey: clientKeys.list({ perPage: 100 }),
		queryFn: () => clientApi.getClients({ perPage: 100 }),
		staleTime: 5 * 60 * 1000,
	});

	const clientFilterOptions = useMemo(
		() =>
			(clientsQuery.data?.clients ?? []).map((client) => ({
				value: String(client.id),
				label: client.company_name ? `${client.display_name} / ${client.company_name}` : client.display_name,
			})),
		[clientsQuery.data?.clients],
	);

	const projects = projectsQuery.data?.projects ?? [];
	const pagination = projectsQuery.data?.pagination;

	const updateFilters = (partialFilters: Partial<ProjectFilters>) => {
		setFilters((currentFilters) => ({
			...currentFilters,
			...partialFilters,
			page: partialFilters.page ?? 1,
		}));
	};

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

	const handleTogglePin = useCallback(async (project: Project) => {
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
	}, [pinProject, unpinProject]);

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

	const projectColumns = useMemo(() => buildProjectColumns(canViewProjectBudget, handleTogglePin), [canViewProjectBudget, handleTogglePin]);

	const tableFilters = (
		<ProjectListFilters
			filters={filters}
			clientOptions={clientFilterOptions}
			isClientOptionsLoading={clientsQuery.isLoading}
			pagination={pagination}
			onChange={updateFilters}
		/>
	);

	return (
		<section className="flex flex-col gap-4">
			<ProjectListHeader
				canCreateProjects={canCreateProjects}
				onCreateProject={handleCreateClick}
			/>

			<DataTable
				columns={projectColumns}
				data={projects}
				keyExtractor={(project) => project.projectId}
				isLoading={projectsQuery.isLoading}
				error={projectsQuery.error}
				pagination={pagination}
				onPageChange={(page) => updateFilters({ page })}
				onRowClick={handleView}
				filters={tableFilters}
				rowActions={(project) => (
					<ProjectRowActions
						project={project}
						canDelete={canDeleteProjects}
						onView={handleView}
						onTogglePin={handleTogglePin}
						onDelete={setProjectToDelete}
					/>
				)}
				emptyState={{
					icon: FolderKanban,
					title: "No projects found",
					description: "Create a project or adjust the filters.",
					action: canCreateProjects ? { label: "New project", onClick: handleCreateClick } : undefined,
				}}
			/>

			<CreateProjectForm
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
			/>

			<ProjectDeleteDialog
				project={projectToDelete}
				isLoading={deleteProject.isPending}
				onOpenChange={(open) => {
					if (!open) {
						setProjectToDelete(null);
					}
				}}
				onConfirm={handleConfirmDelete}
			/>
		</section>
	);
}
