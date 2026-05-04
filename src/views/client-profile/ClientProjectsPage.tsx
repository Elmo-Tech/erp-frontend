"use client";

import { useState } from "react";
import { CalendarDays, Plus, Rocket } from "lucide-react";
import { toast } from "sonner";
import { useGetClientProjects } from "@/entities/project/api/project.api";
import { ProjectStatusColors, ProjectStatusLabels } from "@/entities/project/model/types";
import { useProjectPermissions } from "@/entities/user/model/permissions";
import { CreateProjectForm } from "@/features/projects/ui/CreateProjectForm";
import { useClientProfile } from "@/widgets/client-management/model/client-profile.context";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/ui/data-display/EmptyState";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

export default function ClientProjectsPage() {
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

			{projectsQuery.isLoading ? (
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
					<Skeleton className="h-36 rounded-md" />
					<Skeleton className="h-36 rounded-md" />
				</div>
			) : projectsQuery.isError ? (
				<div className="rounded-md border bg-background px-5 py-8 text-sm text-muted-foreground">Projects could not be loaded.</div>
			) : projects.length === 0 ? (
				<Empty className="min-h-80 rounded-md border bg-background">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Rocket />
						</EmptyMedia>
						<EmptyTitle>No projects yet</EmptyTitle>
						<EmptyDescription>Start the first delivery workspace for this client.</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button
							variant="outline"
							size="sm"
							onClick={handleCreateProject}
						>
							<Plus data-icon="inline-start" />
							New Project
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
					{projects.map((project) => (
						<article
							key={project.projectId}
							className="rounded-md border bg-background p-4 transition-colors hover:bg-muted/30"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<h3 className="truncate text-sm font-medium">{project.title}</h3>
									<p className="mt-1 text-xs text-muted-foreground">{getProjectType(project.description)}</p>
								</div>
								<Badge
									variant="outline"
									className={cn("shrink-0", ProjectStatusColors[project.status])}
								>
									{ProjectStatusLabels[project.status] ?? project.status}
								</Badge>
							</div>
							<div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
								<CalendarDays className="size-4" />
								<span>Delivery {formatDate(project.deadline)}</span>
							</div>
						</article>
					))}
				</div>
			)}

			<CreateProjectForm
				clientId={client.clientId}
				clientName={clientName}
				open={projectModalOpen}
				onOpenChange={setProjectModalOpen}
			/>
		</section>
	);
}

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
