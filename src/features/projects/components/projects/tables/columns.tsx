"use client";

import { Column } from "@/components/shared/data-display/DataTable";
import { ProjectStatusBadge } from "@/components/shared/StatusBadge";
import { Project } from "../../../types/project";
import { formatDateDisplay } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, Trash2, Pin } from "lucide-react";

interface ProjectColumnsOptions {
	onView?: (project: Project) => void;
	onEdit?: (project: Project) => void;
	onDelete?: (project: Project) => void;
	onPin?: (project: Project) => void;
	canDeleteProjects?: boolean;
	canEditProjects?: boolean;
}

export function getProjectsColumns(options: ProjectColumnsOptions = {}): Column<Project>[] {
	const { onView, onEdit, onDelete, onPin, canDeleteProjects, canEditProjects } = options;

	const columns: Column<Project>[] = [
		{
			key: "pin",
			header: "",
			render: (project) => (
				<Button
					variant="ghost"
					size="icon"
					className={`h-8 w-8 ${project.isPinned ? "text-primary" : "text-muted-foreground opacity-50 hover:opacity-100"}`}
					onClick={(e) => {
						e.stopPropagation();
						onPin?.(project);
					}}
					title={project.isPinned ? "Unpin project" : "Pin project"}
				>
					<Pin className={`h-4 w-4 ${project.isPinned ? "fill-current" : ""}`} />
				</Button>
			),
		},
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
			key: "projectType",
			header: "Type",
			render: (project) => <span className={project.projectType ? "font-medium" : "text-muted-foreground"}>{project.projectType?.label || "Not set"}</span>,
		},
		{
			key: "status",
			header: "Status",
			render: (project) => <ProjectStatusBadge status={project.status} />,
		},
		{
			key: "deadline",
			header: "Deadline",
			render: (project) => <span className={project.deadline ? "" : "text-muted-foreground"}>{formatDateDisplay(project.deadline)}</span>,
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
