"use client";

import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Progress } from "@/shared/ui/progress";
import { Skeleton } from "@/shared/ui/skeleton";
import { useState } from "react";
import { useClientPortalProjects } from "../model/use-client-portal";

export function ClientPortalProjects() {
	const [search, setSearch] = useState("");
	const projectsQuery = useClientPortalProjects({ search: search || undefined, perPage: 20 });
	const projects = projectsQuery.data?.projects ?? [];

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
					<p className="text-sm text-muted-foreground">Client-scoped project progress and milestones.</p>
				</div>
				<Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects" className="h-9 sm:w-72" />
			</div>

			{projectsQuery.isLoading ? (
				<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
					{[1, 2, 3].map((item) => (
						<Skeleton key={item} className="h-32" />
					))}
				</div>
			) : projects.length ? (
				<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
					{projects.map((project) => (
						<Link key={project.projectId} href={`/client/projects/${project.projectId}`}>
							<Card className="h-full transition-colors hover:bg-muted/40">
								<CardContent className="space-y-3 p-4">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<div className="truncate font-medium">{project.title}</div>
											<div className="text-xs text-muted-foreground">Due {project.deadline ? new Date(project.deadline).toLocaleDateString() : "not set"}</div>
										</div>
										<Badge variant="outline" className="rounded-sm text-[11px]">
											{project.statusLabel || project.status}
										</Badge>
									</div>
									<div className="space-y-1">
										<div className="flex justify-between text-xs text-muted-foreground">
											<span>Progress</span>
											<span>{project.progressPercentage ?? 0}%</span>
										</div>
										<Progress value={project.progressPercentage ?? 0} className="h-1.5" />
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			) : (
				<div className="flex h-48 flex-col items-center justify-center rounded-md border text-sm text-muted-foreground">
					<FolderKanban className="mb-2 size-5" />
					No projects found.
				</div>
			)}
		</div>
	);
}
