"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Rocket } from "lucide-react";
import { toast } from "sonner";
import { useGetClientProjects } from "@/entities/project/api/project.api";
import { ProjectStatusColors, ProjectStatusLabels, type Project } from "@/entities/project/model/types";
import { useProjectPermissions } from "@/entities/user/model/permissions";
import { CreateProjectForm } from "@/features/projects/ui/CreateProjectForm";
import { useClientProfile } from "@/widgets/client-management/model/client-profile.context";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { cn } from "@/shared/lib/utils";

export default function ClientProjectsPage() {
	const router = useRouter();
	const client = useClientProfile();
	const [projectModalOpen, setProjectModalOpen] = useState(false);
	const { canCreateProjects } = useProjectPermissions();
	const projectsQuery = useGetClientProjects(client.clientId);
	const projects = projectsQuery.data ?? [];

	const clientName = client.displayName || client.name;
	const handleCreateProject = () => {
		if (!canCreateProjects) {
			toast.error("You do not have permission to create projects");
			return;
		}

		setProjectModalOpen(true);
	};

	return (
		<section className="flex flex-col gap-4">
			<div className="flex items-center justify-end">
				<Button
					size="sm"
					onClick={handleCreateProject}
				>
					<Plus data-icon="inline-start" />
					New Project
				</Button>
			</div>

			<DataTable
				columns={projectColumns}
				data={projects}
				keyExtractor={(project) => project.projectId}
				isLoading={projectsQuery.isLoading}
				error={projectsQuery.error}
				onRowClick={(project) => router.push(`/dashboard/projects/${project.projectId}`)}
				emptyState={{
					icon: Rocket,
					title: "No projects yet",
					description: "Start the first delivery workspace for this client.",
					action: canCreateProjects ? { label: "New Project", onClick: handleCreateProject } : undefined,
				}}
			/>

			<CreateProjectForm
				clientId={client.clientId}
				clientName={clientName}
				open={projectModalOpen}
				onOpenChange={setProjectModalOpen}
			/>
		</section>
	);
}

const projectColumns: Column<Project>[] = [
	{
		key: "title",
		header: "Project",
		render: (project) => (
			<div className="min-w-0">
				<div className="truncate font-medium">{project.title}</div>
				<div className="truncate text-xs text-muted-foreground">{getProjectType(project.description)}</div>
			</div>
		),
	},
	{
		key: "status",
		header: "Status",
		render: (project) => (
			<Badge
				variant="outline"
				className={cn("shrink-0", ProjectStatusColors[project.status])}
			>
				{ProjectStatusLabels[project.status] ?? project.status}
			</Badge>
		),
	},
	{
		key: "deadline",
		header: "Delivery",
		render: (project) => <span className="text-xs tabular-nums text-muted-foreground">{formatDate(project.deadline)}</span>,
	},
];

function getProjectType(description: string | null | undefined) {
	const match = description?.match(/^Project Type:\s*(.+)$/m);
	return match?.[1] ?? "Client Project";
}

function formatDate(value: string | null | undefined) {
	if (!value) {
		return "not set";
	}

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(value));
}
