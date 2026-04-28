"use client";

import { useState } from "react";
import { BookOpen, FolderKanban } from "lucide-react";
import { projectApi } from "@/entities/project/api/project.api";
import { useProjectWikis } from "@/features/wiki/model/use-wiki-actions";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

export function WikiWidget() {
	const projectsQuery = useQuery({
		queryKey: ["knowledge-base", "projects"],
		queryFn: () => projectApi.getProjects({ perPage: 50 }),
	});
	const projects = projectsQuery.data?.projects ?? [];
	const [selectedProjectId, setSelectedProjectId] = useState<string>("");
	const activeProjectId = Number(selectedProjectId || projects[0]?.projectId || 0);
	const wikisQuery = useProjectWikis(activeProjectId || undefined);
	const wikis = wikisQuery.data?.wikis ?? [];

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Wiki</h1>
					<p className="text-sm text-muted-foreground">Project knowledge base and internal notes.</p>
				</div>
				<Select value={selectedProjectId || String(projects[0]?.projectId ?? "")} onValueChange={setSelectedProjectId} disabled={projectsQuery.isLoading || !projects.length}>
					<SelectTrigger className="h-9 w-full sm:w-80">
						<SelectValue placeholder="Select project" />
					</SelectTrigger>
					<SelectContent>
						{projects.map((project) => (
							<SelectItem key={project.projectId} value={String(project.projectId)}>
								{project.title}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-sm">
						<BookOpen className="size-4" />
						Articles
					</CardTitle>
				</CardHeader>
				<CardContent>
					{wikisQuery.isLoading ? (
						<div className="space-y-2">
							<Skeleton className="h-14 w-full" />
							<Skeleton className="h-14 w-full" />
							<Skeleton className="h-14 w-full" />
						</div>
					) : (
						<div className="divide-y rounded-md border">
							{wikis.length ? (
								wikis.map((wiki) => (
									<div key={wiki.wikiId} className="px-3 py-2 text-sm">
										<div className="flex items-center justify-between gap-3">
											<p className="truncate font-medium">{wiki.title}</p>
											<Badge variant="secondary">{wiki.isEncrypted ? "Encrypted" : "Visible"}</Badge>
										</div>
										<p className="line-clamp-1 text-xs text-muted-foreground">{wiki.content || "No summary available."}</p>
									</div>
								))
							) : (
								<div className="flex flex-col items-center gap-2 px-3 py-8 text-sm text-muted-foreground">
									<FolderKanban className="size-5" />
									No wiki articles for this project.
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
