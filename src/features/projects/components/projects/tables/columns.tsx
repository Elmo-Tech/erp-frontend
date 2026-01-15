"use client";

import { Column } from "@/components/shared/data-display/DataTable";
import { ProjectStatusBadge } from "@/components/shared/StatusBadge";
import { Project } from "../../../types/project";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";

interface ProjectColumnsOptions {
	onView?: (project: Project) => void;
	onEdit?: (project: Project) => void;
	onDelete?: (project: Project) => void;
	canDeleteProjects?: boolean;
	canEditProjects?: boolean;
	canViewProjectBudget?: boolean;
}

export function getProjectsColumns(options: ProjectColumnsOptions = {}): Column<Project>[] {
	const { onView, onEdit, onDelete, canDeleteProjects, canEditProjects, canViewProjectBudget } = options;

	const columns: Column<Project>[] = [
		{
			key: "title",
			header: "Title",
			render: (project) => (
				<div>
					<p className="font-semibold">{project.title}</p>
					{project.description && <p className="text-sm text-muted-foreground truncate max-w-xs">{project.description}</p>}
				</div>
			),
		},
		{
			key: "client",
			header: "Client",
			render: (project) =>
				project.client ? (
					<div>
						<p className="font-medium">{project.client.name}</p>
						<p className="text-sm text-muted-foreground">{project.client.email}</p>
					</div>
				) : (
					<span className="text-muted-foreground">No client</span>
				),
		},
		{
			key: "status",
			header: "Status",
			render: (project) => <ProjectStatusBadge status={project.status} />,
		},
		{
			key: "budget",
			header: "Budget",
			render: (project) => <span className="font-mono">{canViewProjectBudget ? formatCurrency(project.budget) : "****"}</span>, // Hide budget if user doesn't have permission to viewformatCurrency(project.budget)}</span>,
		},
		{
			key: "deadline",
			header: "Deadline",
			render: (project) => <span className={project.deadline ? "" : "text-muted-foreground"}>{formatDate(project.deadline)}</span>,
		},
	];

	// Add actions column if any action is provided
	if (onView || onEdit || onDelete) {
		columns.push({
			key: "actions",
			header: "",
			render: (project) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={(e) => e.stopPropagation()}
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{onView && (
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									onView(project);
								}}
							>
								<Eye className="h-4 w-4 mr-2" />
								View Details
							</DropdownMenuItem>
						)}
						{canEditProjects && onEdit && (
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									onEdit(project);
								}}
							>
								<Pencil className="h-4 w-4 mr-2" />
								Edit
							</DropdownMenuItem>
						)}
						{canDeleteProjects && onDelete && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										onDelete(project);
									}}
									className="text-destructive focus:text-destructive"
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			),
		});
	}

	return columns;
}
