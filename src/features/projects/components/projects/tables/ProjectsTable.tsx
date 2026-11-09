"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { projectsApi } from "../../../api/projects";
import { projectKeys } from "../../../hooks/useProjects";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-display/DataTable";
import { SearchInput } from "@/components/shared/filters/SearchInput";
import { FilterSelect, FilterOption } from "@/components/shared/filters/FilterSelect";
import { FilterBar } from "@/components/shared/filters/FilterBar";
import { DeleteProjectDialog } from "../dialogs/DeleteProjectDialog";
import { usePinProject, useUnpinProject } from "../../../hooks/useProjects";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { Project, ProjectFilters } from "../../../types/project";
import { getProjectsColumns } from "./columns";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { useLookupOptions } from "@/features/settings/hooks/useLookupOptions";
import { FolderOpen, Filter, Users, Plus } from "lucide-react";
import { notifyApiError } from "@/lib/errorHandling";

interface ProjectsTableProps {
	onProjectClick?: (project: Project) => void;
	onCreateProject?: () => void;
	onEditProject?: (project: Project) => void;
	className?: string;
}

export function ProjectsTable({ onProjectClick, onCreateProject, onEditProject, className = "" }: ProjectsTableProps) {
	const router = useRouter();
	const { canDeleteProjects, canEditProjects } = usePermissions();
	const canViewTrash = useAuthStore((state) => state.hasPermission("view_deleted_projects"));
	const pinProject = usePinProject();
	const unpinProject = useUnpinProject();

	const [filters, setFilters] = useState<ProjectFilters>({
		search: "",
		status: undefined,
		clientId: undefined,
		perPage: 10,
	});

	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

	const { data: projectsResponse, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage, isFetchNextPageError } = useInfiniteQuery({
		queryKey: [...projectKeys.lists(), "infinite", filters],
		queryFn: ({ pageParam }) => projectsApi.getAll({ ...filters, page: pageParam }),
		initialPageParam: 1,
		getNextPageParam: (last) => last.pagination.currentPage < last.pagination.totalPages ? last.pagination.currentPage + 1 : undefined,
		staleTime: 30_000,
		refetchInterval: 60_000,
	});
	const projects = useMemo(() => {
		const unique = new Map<number, Project>();
		for (const page of projectsResponse?.pages ?? []) for (const project of page.projects) unique.set(project.projectId, project);
		return [...unique.values()];
	}, [projectsResponse]);
	const sentinel = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const element = sentinel.current;
		if (!element || !hasNextPage || isFetchingNextPage || isFetchNextPageError || typeof IntersectionObserver === "undefined") return;
		const observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) void fetchNextPage(); }, { rootMargin: "200px" });
		observer.observe(element);
		return () => observer.disconnect();
	}, [fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError, projects.length]);
	const { data: projectStatusesResponse } = useLookupOptions("project_status");

	const statusOptions: FilterOption[] = (projectStatusesResponse?.data ?? []).map((status) => ({
		value: status.value,
		label: status.is_active ? status.label : `${status.label} (Inactive)`,
	}));

	const clientOptions: FilterOption[] = useMemo(() => {
		if (!projects.length) return [];

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
	}, [projects]);


	const handleSearchChange = (value: string) => {
		setFilters((prev) => ({ ...prev, search: value || undefined }));
	};

	const handleStatusChange = (value: string | undefined) => {
		setFilters((prev) => ({
			...prev,
			status: value,
		}));
	};

	const handleClientChange = (value: string | undefined) => {
		setFilters((prev) => ({
			...prev,
			clientId: value ? parseInt(value) : undefined,
		}));
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


	const handlePinProject = async (project: Project) => {
		try {
			if (project.isPinned) {
				await unpinProject.mutateAsync(project.projectId);
			} else {
				await pinProject.mutateAsync(project.projectId);
			}
		} catch (error) {
			notifyApiError(error);
		}
	};


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
			{canViewTrash && <Button asChild variant="outline" className="mb-3"><Link href="/dashboard/projects/trash">Deleted projects</Link></Button>}
			<DataTable
				title="Projects"
				titleBadge={projectsResponse?.pages[0]?.pagination ? `${projectsResponse.pages[0].pagination.total} ${projectsResponse.pages[0].pagination.total === 1 ? "project" : "projects"}` : undefined}
				columns={columns}
				data={projects}
				keyExtractor={(project) => project.projectId}
				isLoading={isLoading}
				error={projectsResponse ? null : error}
				footer={hasNextPage ? <div ref={sentinel} className="flex justify-center py-4"><Button variant="outline" disabled={isFetchingNextPage} onClick={() => void fetchNextPage()}>{isFetchingNextPage ? "Loading more projects…" : isFetchNextPageError ? "Retry loading projects" : "Load more projects"}</Button></div> : undefined}
				onRowClick={handleRowClick}
				className={className}
				emptyState={{
					icon: FolderOpen,
					title: filters.search || filters.status || filters.clientId ? "No projects match your filters" : "No projects yet",
					description: filters.search || filters.status || filters.clientId ? "Try a different search or filter to see more projects." : "Get started by creating your first project.",
					action: onCreateProject && !(filters.search || filters.status || filters.clientId) ? { label: "Create Project", onClick: onCreateProject } : undefined,
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

					</FilterBar>
				}
			/>

			{projectToDelete && <DeleteProjectDialog key={projectToDelete.projectId} project={projectToDelete} onOpenChange={() => setProjectToDelete(null)} />}
		</>
	);
}
