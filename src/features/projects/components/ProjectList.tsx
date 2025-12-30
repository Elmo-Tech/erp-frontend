"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Search, Filter, Users, FolderOpen } from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { Project, ProjectStatus, ProjectFilters } from "../types/project";
import { getStatusLabel, getStatusColor } from "../helpers/statusHelpers";

interface ProjectListProps {
	onProjectClick?: (project: Project) => void;
	onCreateProject?: () => void;
	className?: string;
}

/**
 * ProjectList component for displaying projects in a filterable table format
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8
 */
export const ProjectList: React.FC<ProjectListProps> = ({ onProjectClick, onCreateProject, className = "" }) => {
	const router = useRouter();

	// Filter state
	const [filters, setFilters] = useState<ProjectFilters>({
		search: "",
		status: undefined,
		clientId: undefined,
		page: 1,
		perPage: 10,
	});

	// Fetch projects with current filters
	const { data: projectsResponse, isLoading, error } = useProjects(filters);

	// Handle search input change with debouncing
	const handleSearchChange = (value: string) => {
		setFilters((prev) => ({
			...prev,
			search: value || undefined,
			page: 1, // Reset to first page when searching
		}));
	};

	// Handle status filter change
	const handleStatusChange = (value: string) => {
		setFilters((prev) => ({
			...prev,
			status: value === "all" ? undefined : (value as ProjectStatus),
			page: 1, // Reset to first page when filtering
		}));
	};

	// Handle client filter change
	const handleClientChange = (value: string) => {
		setFilters((prev) => ({
			...prev,
			clientId: value === "all" ? undefined : parseInt(value),
			page: 1, // Reset to first page when filtering
		}));
	};

	// Handle pagination
	const handlePageChange = (page: number) => {
		setFilters((prev) => ({ ...prev, page }));
	};

	// Handle row click navigation
	const handleRowClick = (project: Project) => {
		if (onProjectClick) {
			onProjectClick(project);
		} else {
			// Default navigation to project details page
			router.push(`/projects/${project.projectId}`);
		}
	};

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	// Format date
	const formatDate = (dateString: string | null) => {
		if (!dateString) return "Not set";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Get unique clients for filter dropdown
	const uniqueClients = useMemo(() => {
		if (!projectsResponse?.projects) return [];

		const clientMap = new Map();
		projectsResponse.projects.forEach((project) => {
			if (project.client && !clientMap.has(project.client.userId)) {
				clientMap.set(project.client.userId, project.client);
			}
		});

		return Array.from(clientMap.values());
	}, [projectsResponse?.projects]);

	// Loading state
	if (isLoading) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle>Projects</CardTitle>
					<div className="flex gap-4">
						<Skeleton className="h-10 w-64" />
						<Skeleton className="h-10 w-32" />
						<Skeleton className="h-10 w-32" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton
								key={i}
								className="h-16 w-full"
							/>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	// Error state
	if (error) {
		return (
			<Card className={className}>
				<CardContent className="flex items-center justify-center h-64">
					<div className="text-center space-y-2">
						<AlertCircle className="h-8 w-8 text-destructive mx-auto" />
						<p className="text-sm text-muted-foreground">Failed to load projects</p>
						<p className="text-xs text-muted-foreground">{error.message}</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Empty state
	if (!projectsResponse?.projects || projectsResponse.projects.length === 0) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle>Projects</CardTitle>
					<div className="flex gap-4">
						<div className="relative flex-1 max-w-sm">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search projects..."
								value={filters.search || ""}
								onChange={(e) => handleSearchChange(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select
							value={filters.status || "all"}
							onValueChange={handleStatusChange}
						>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="All Statuses" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								{Object.values(ProjectStatus).map((status) => (
									<SelectItem
										key={status}
										value={status}
									>
										{getStatusLabel(status)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={filters.clientId?.toString() || "all"}
							onValueChange={handleClientChange}
						>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="All Clients" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Clients</SelectItem>
								{uniqueClients.map((client) => (
									<SelectItem
										key={client.userId}
										value={client.userId.toString()}
									>
										{client.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{onCreateProject && <Button onClick={onCreateProject}>Create Project</Button>}
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-64 border-2 border-dashed border-muted rounded-lg">
						<div className="text-center space-y-2">
							<FolderOpen className="h-8 w-8 text-muted-foreground mx-auto" />
							<p className="text-sm text-muted-foreground">{filters.search || filters.status || filters.clientId ? "No projects match your filters" : "No projects yet"}</p>
							{onCreateProject && !filters.search && !filters.status && !filters.clientId && (
								<Button
									variant="outline"
									onClick={onCreateProject}
								>
									Create your first project
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	const { projects, pagination } = projectsResponse;

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Projects</span>
					<Badge variant="secondary">
						{pagination.total} {pagination.total === 1 ? "project" : "projects"}
					</Badge>
				</CardTitle>

				{/* Filters */}
				<div className="flex gap-4 flex-wrap">
					<div className="relative flex-1 max-w-sm">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search projects..."
							value={filters.search || ""}
							onChange={(e) => handleSearchChange(e.target.value)}
							className="pl-10"
						/>
					</div>

					<Select
						value={filters.status || "all"}
						onValueChange={handleStatusChange}
					>
						<SelectTrigger className="w-40">
							<Filter className="h-4 w-4 mr-2" />
							<SelectValue placeholder="All Statuses" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							{Object.values(ProjectStatus).map((status) => (
								<SelectItem
									key={status}
									value={status}
								>
									{getStatusLabel(status)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={filters.clientId?.toString() || "all"}
						onValueChange={handleClientChange}
					>
						<SelectTrigger className="w-40">
							<Users className="h-4 w-4 mr-2" />
							<SelectValue placeholder="All Clients" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Clients</SelectItem>
							{uniqueClients.map((client) => (
								<SelectItem
									key={client.userId}
									value={client.userId.toString()}
								>
									{client.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{onCreateProject && <Button onClick={onCreateProject}>Create Project</Button>}
				</div>
			</CardHeader>

			<CardContent>
				{/* Projects Table */}
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead>Client</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Budget</TableHead>
								<TableHead>Deadline</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{projects.map((project) => (
								<TableRow
									key={project.projectId}
									className="cursor-pointer hover:bg-muted/50"
									onClick={() => handleRowClick(project)}
								>
									<TableCell className="font-medium">
										<div>
											<p className="font-semibold">{project.title}</p>
											{project.description && <p className="text-sm text-muted-foreground truncate max-w-xs">{project.description}</p>}
										</div>
									</TableCell>
									<TableCell>
										{project.client ? (
											<div>
												<p className="font-medium">{project.client.name}</p>
												<p className="text-sm text-muted-foreground">{project.client.email}</p>
											</div>
										) : (
											<span className="text-muted-foreground">No client</span>
										)}
									</TableCell>
									<TableCell>
										<Badge className={getStatusColor(project.status)}>{getStatusLabel(project.status)}</Badge>
									</TableCell>
									<TableCell>
										<span className="font-mono">{formatCurrency(project.budget)}</span>
									</TableCell>
									<TableCell>
										<span className={project.deadline ? "" : "text-muted-foreground"}>{formatDate(project.deadline)}</span>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				{pagination.totalPages > 1 && (
					<div className="flex items-center justify-between mt-4">
						<p className="text-sm text-muted-foreground">
							Showing {(pagination.currentPage - 1) * pagination.perPage + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total} projects
						</p>

						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePageChange(pagination.currentPage - 1)}
								disabled={pagination.currentPage <= 1}
							>
								Previous
							</Button>

							<div className="flex items-center space-x-1">
								{Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
									const page = i + 1;
									return (
										<Button
											key={page}
											variant={pagination.currentPage === page ? "default" : "outline"}
											size="sm"
											onClick={() => handlePageChange(page)}
											className="w-8 h-8 p-0"
										>
											{page}
										</Button>
									);
								})}

								{pagination.totalPages > 5 && (
									<>
										<span className="text-muted-foreground">...</span>
										<Button
											variant={pagination.currentPage === pagination.totalPages ? "default" : "outline"}
											size="sm"
											onClick={() => handlePageChange(pagination.totalPages)}
											className="w-8 h-8 p-0"
										>
											{pagination.totalPages}
										</Button>
									</>
								)}
							</div>

							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePageChange(pagination.currentPage + 1)}
								disabled={pagination.currentPage >= pagination.totalPages}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
