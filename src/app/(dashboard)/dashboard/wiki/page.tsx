"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";
import { WikiList } from "@/features/projects/components/WikiList";
import { useProjects } from "@/features/projects/hooks/useProjects";

export default function WikiPage() {
	const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

	const { data: projectsData, isLoading: isLoadingProjects } = useProjects({ perPage: 100 });

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Wiki</h1>
					<p className="text-muted-foreground">Technical documentation and credentials</p>
				</div>

				{/* Project Selector */}
				<div className="w-64">
					{isLoadingProjects ? (
						<Skeleton className="h-10 w-full" />
					) : (
						<Select
							value={selectedProjectId?.toString() || ""}
							onValueChange={(value) => {
								setSelectedProjectId(value ? parseInt(value) : null);
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a project" />
							</SelectTrigger>
							<SelectContent>
								{projectsData?.projects.map((project) => (
									<SelectItem
										key={project.projectId}
										value={project.projectId.toString()}
									>
										{project.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</div>
			</div>

			{selectedProjectId ? (
				<WikiList projectId={selectedProjectId} />
			) : (
				<Card>
					<CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
						<BookOpen className="h-12 w-12 mb-4" />
						<p>Select a project to view its wiki documentation</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
