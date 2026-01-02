"use client";

import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/shared/data-display/DataTable";
import { Project } from "../../types/project";
import { getStatusLabel, getStatusColor } from "../../helpers/statusHelpers";
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
			render: (project) => <Badge className={getStatusColor(project.status)}>{getStatusLabel(project.status)}</Badge>,
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
