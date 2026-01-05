"use client";

import { Column } from "@/components/shared/data-display/DataTable";
import { ProjectStatusBadge } from "@/components/shared/StatusBadge";
import { Project } from "../../types/project";
import { formatCurrency, formatDate } from "@/lib/formatters";

export function getProjectsColumns(): Column<Project>[] {
	return [
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
			render: (project) => <span className="font-mono">{formatCurrency(project.budget)}</span>,
		},
		{
			key: "deadline",
			header: "Deadline",
			render: (project) => <span className={project.deadline ? "" : "text-muted-foreground"}>{formatDate(project.deadline)}</span>,
		},
	];
}
