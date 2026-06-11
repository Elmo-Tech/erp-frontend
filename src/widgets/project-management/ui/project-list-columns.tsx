import { Pin } from "lucide-react";
import type { Project } from "@/entities/project/model/types";
import { ProjectStatusBadge } from "@/entities/project/ui/ProjectStatusBadge";
import { Button } from "@/shared/ui/button";
import type { Column } from "@/shared/ui/data-display/DataTable";
import { formatDateDisplay } from "@/shared/lib/dateUtils";
import { formatCurrency } from "@/shared/lib/formatters";
import { cn } from "@/shared/lib/utils";

export function buildProjectColumns(canViewBudget: boolean, onTogglePin: (project: Project) => void): Column<Project>[] {
	return [
		{
			key: "pinned",
			header: "",
			className: "w-12",
			render: (project) => (
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label={project.isPinned ? `Unpin ${project.title}` : `Pin ${project.title}`}
					className={cn("text-muted-foreground", project.isPinned && "text-foreground")}
					onClick={(event) => {
						event.stopPropagation();
						onTogglePin(project);
					}}
				>
					<Pin className={cn(project.isPinned && "fill-current")} />
				</Button>
			),
		},
		{
			key: "project",
			header: "Project",
			render: (project) => (
				<div className="min-w-0">
					<div className="truncate font-medium leading-5">{project.title}</div>
					<div className="truncate text-xs text-muted-foreground">{project.description || "No description"}</div>
				</div>
			),
		},
		{
			key: "client",
			header: "Client",
			render: (project) => (
				<div className="min-w-0">
					<div className="truncate leading-5">{project.client?.name || "No client"}</div>
					<div className="truncate text-xs text-muted-foreground">{project.client?.email || "No email"}</div>
				</div>
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
			className: "whitespace-nowrap text-sm text-muted-foreground",
			render: (project) => {
				const canShowBudget = canViewBudget && project.canViewBudget !== false && project.budget !== null;

				return canShowBudget ? formatCurrency(project.budget ?? 0, project.currency || "USD") : "Restricted";
			},
		},
		{
			key: "deadline",
			header: "Deadline",
			className: "whitespace-nowrap text-sm text-muted-foreground",
			render: (project) => formatDateDisplay(project.deadline),
		},
	];
}
