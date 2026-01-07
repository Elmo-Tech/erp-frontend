"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-display/DataTable";
import { SearchInput } from "@/components/shared/filters/SearchInput";
import { FilterSelect, FilterOption } from "@/components/shared/filters/FilterSelect";
import { FilterBar } from "@/components/shared/filters/FilterBar";
import { useProjects } from "../../../hooks/useProjects";
import { Project, ProjectFilters } from "../../../types/project";
import { ProjectStatus, ProjectStatusLabels } from "@/lib/statusHelpers";
import { getProjectsColumns } from "./columns";
import { FolderOpen, Filter, Users, Plus } from "lucide-react";

interface ProjectsTableProps {
	onProjectClick?: (project: Project) => void;
	onCreateProject?: () => void;
	className?: string;
}

export function ProjectsTable({ onProjectClick, onCreateProject, className = "" }: ProjectsTableProps) {
	const router = useRouter();

	const [filters, setFilters] = useState<ProjectFilters>({
		search: "",
		status: undefined,
		clientId: undefined,
		page: 1,
		perPage: 10,
	});

	const { data: projectsResponse, isLoading, error } = useProjects(filters);

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

	const columns = getProjectsColumns();

	return (
		<DataTable
			title="Projects"
			titleBadge={projectsResponse?.pagination ? `${projectsResponse.pagination.total} ${projectsResponse.pagination.total === 1 ? "project" : "projects"}` : undefined}
			columns={columns}
			data={projectsResponse?.projects || []}
			keyExtractor={(project) => project.projectId}
			isLoading={isLoading}
			error={error}
			pagination={projectsResponse?.pagination}
			onPageChange={handlePageChange}
			onRowClick={handleRowClick}
			className={className}
			emptyState={{
				icon: FolderOpen,
				title: filters.search || filters.status || filters.clientId ? "No projects match your filters" : "No projects yet",
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
				</FilterBar>
			}
		/>
	);
}
