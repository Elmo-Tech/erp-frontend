"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-display/DataTable";
import { SearchInput } from "@/components/shared/filters/SearchInput";
import { FilterSelect, FilterOption } from "@/components/shared/filters/FilterSelect";
import { FilterBar } from "@/components/shared/filters/FilterBar";
import { ConfirmDialog } from "@/components/shared";
import { useProjects, useDeleteProject, usePinProject, useUnpinProject } from "../../../hooks/useProjects";
import { Project, ProjectFilters } from "../../../types/project";
import { ProjectStatus, ProjectStatusLabels } from "@/lib/statusHelpers";
import { getProjectsColumns } from "./columns";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { useLookupOptions } from "@/features/settings/hooks/useLookupOptions";
import { FolderOpen, Filter, Tags, Users, Plus } from "lucide-react";
import { toast } from "sonner";

interface ProjectsTableProps {
	onProjectClick?: (project: Project) => void;
	onCreateProject?: () => void;
	onEditProject?: (project: Project) => void;
	className?: string;
}

export function ProjectsTable({ onProjectClick, onCreateProject, onEditProject, className = "" }: ProjectsTableProps) {
	const router = useRouter();
	const { canDeleteProjects, canEditProjects } = usePermissions();
	const deleteProject = useDeleteProject();
	const pinProject = usePinProject();
	const unpinProject = useUnpinProject();

	const [filters, setFilters] = useState<ProjectFilters>({
		search: "",
		status: undefined,
		clientId: undefined,
		projectTypeId: undefined,
		page: 1,
		perPage: 10,
	});

	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

	const { data: projectsResponse, isLoading, error } = useProjects(filters);
	const { data: projectTypesResponse, isLoading: isProjectTypesLoading } = useLookupOptions("project_type");

	const statusOptions: FilterOption[] = Object.values(ProjectStatus).map((status) => ({
		value: status,
		label: ProjectStatusLabels[status],
	}));

	const clientOptions: FilterOption[] = useMemo(() => {
		const projects = projectsResponse?.projects;
		if (!projects) return [];

		const clientMap = new Map();
		projects.forEach((project) => {
			if (project.client && !clientMap.has(project.client.clientId)) {
				clientMap.set(project.client.clientId, {
					value: project.client.clientId.toString(),
					label: project.client.name,
				});
			}
		});

		return Array.from(clientMap.values());
	}, [projectsResponse?.projects]);

	const projectTypeOptions: FilterOption[] = useMemo(
		() => (projectTypesResponse?.data ?? [])
			.filter((projectType) => projectType.is_active)
			.map((projectType) => ({ value: String(projectType.id), label: projectType.label })),
		[projectTypesResponse?.data]
	);

	const handleSearchChange = (value: string) => {
		setFilters((prev) => ({ ...prev, search: value || undefined, page: 1 }));
	};

	const handleStatusChange = (value: string | undefined) => {
		setFilters((prev) => ({
			...prev,
			status: value as ProjectStatus | undefined,
			page: 1,
		}));
	};

	const handleClientChange = (value: string | undefined) => {
		setFilters((prev) => ({
			...prev,
			clientId: value ? parseInt(value) : undefined,
			page: 1,
		}));
	};

	const handleProjectTypeChange = (value: string | undefined) => {
		setFilters((prev) => ({
			...prev,
			projectTypeId: value ? parseInt(value) : undefined,
			page: 1,
		}));
	};

	const handlePageChange = (page: number) => {
		setFilters((prev) => ({ ...prev, page }));
	};

	const handleRowClick = (project: Project) => {
		if (onProjectClick) {
			onProjectClick(project);
		} else {
			router.push(`/projects/${project.projectId}`);
		}
	};

	const handleViewProject = (project: Project) => {
		router.push(`/dashboard/projects/${project.projectId}`);
	};

	const handleEditProject = (project: Project) => {
		if (onEditProject) {
			onEditProject(project);
		}
	};

	const handleDeleteProject = async () => {
		if (!projectToDelete) return;

		try {
			await deleteProject.mutateAsync(projectToDelete.projectId);
			toast.success("Project deleted successfully");
			setProjectToDelete(null);
		} catch {
			toast.error("Failed to delete project");
		}
	};

	const handlePinProject = async (project: Project) => {
		try {
			if (project.isPinned) {
				await unpinProject.mutateAsync(project.projectId);
				toast.success("Project unpinned successfully");
			} else {
				await pinProject.mutateAsync(project.projectId);
				toast.success("Project pinned successfully");
			}
		} catch {
			toast.error(project.isPinned ? "Failed to unpin project" : "Failed to pin project");
		}
	};

	// Sorting is now handled server-side, use projects directly
	const projects = projectsResponse?.projects || [];

	const columns = getProjectsColumns({
		onView: handleViewProject,
		onEdit: onEditProject ? handleEditProject : undefined,
		onDelete: canDeleteProjects ? (project) => setProjectToDelete(project) : undefined,
		onPin: handlePinProject,
		canDeleteProjects,
		canEditProjects,
	});

	return (
		<>
			<DataTable
				title="Projects"
				titleBadge={projectsResponse?.pagination ? `${projectsResponse.pagination.total} ${projectsResponse.pagination.total === 1 ? "project" : "projects"}` : undefined}
				columns={columns}
				data={projects}
				keyExtractor={(project) => project.projectId}
				isLoading={isLoading}
				error={error}
				pagination={projectsResponse?.pagination}
				onPageChange={handlePageChange}
				onRowClick={handleRowClick}
				className={className}
				emptyState={{
					icon: FolderOpen,
					title: filters.search || filters.status || filters.clientId || filters.projectTypeId ? "No projects match your filters" : "No projects yet",
					description: "Get started by creating your first project.",
					action: onCreateProject ? { label: "Create Project", onClick: onCreateProject } : undefined,
				}}
				headerActions={
					<FilterBar
						actions={
							onCreateProject && (
								<Button onClick={onCreateProject}>
									<Plus className="h-4 w-4 mr-2" />
									Create Project
								</Button>
							)
						}
					>
						<SearchInput
							value={filters.search}
							onChange={handleSearchChange}
							placeholder="Search projects..."
							className="max-w-sm"
						/>
						<FilterSelect
							value={filters.status}
							onChange={handleStatusChange}
							options={statusOptions}
							placeholder="All Statuses"
							icon={Filter}
						/>
						<FilterSelect
							value={filters.clientId?.toString()}
							onChange={handleClientChange}
							options={clientOptions}
							placeholder="All Clients"
							icon={Users}
						/>
						<FilterSelect
							value={filters.projectTypeId?.toString()}
							onChange={handleProjectTypeChange}
							options={projectTypeOptions}
							placeholder="All Project Types"
							icon={Tags}
							disabled={isProjectTypesLoading}
						/>
					</FilterBar>
				}
			/>

			<ConfirmDialog
				open={!!projectToDelete}
				onOpenChange={() => setProjectToDelete(null)}
				title="Delete Project"
				description={`Are you sure you want to delete "${projectToDelete?.title}"? This will also delete all tasks, files, and history associated with this project. This action cannot be undone.`}
				confirmLabel="Delete"
				onConfirm={handleDeleteProject}
				variant="destructive"
				isLoading={deleteProject.isPending}
			/>
		</>
	);
}
