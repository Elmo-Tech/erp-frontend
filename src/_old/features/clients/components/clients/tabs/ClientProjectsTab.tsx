"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { ProjectStatusBadge } from "@/shared/ui/StatusBadge";
import { Plus } from "lucide-react";
import Link from "next/link";

interface ClientProject {
	projectId: number;
	title: string;
	status: string;
	budget?: number;
	deadline?: string;
}

interface ClientProjectsTabProps {
	projects: ClientProject[];
	onAddProject: () => void;
}

export function ClientProjectsTab({ projects, onAddProject }: ClientProjectsTabProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Projects</CardTitle>
					<CardDescription>All projects associated with this client</CardDescription>
				</div>
				<Button onClick={onAddProject}>
					<Plus className="h-4 w-4 mr-2" />
					Add Project
				</Button>
			</CardHeader>
			<CardContent>
				{projects.length > 0 ? (
					<div className="space-y-3">
						{projects.map((project) => (
							<Link
								key={project.projectId}
								href={`/dashboard/projects/${project.projectId}`}
								className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
							>
								<div>
									<p className="font-medium">{project.title}</p>
									<p className="text-sm text-muted-foreground">
										Budget: ${Number(project.budget || 0).toLocaleString()}
										{project.deadline && ` • Due: ${project.deadline}`}
									</p>
								</div>
								<ProjectStatusBadge status={project.status} />
							</Link>
						))}
					</div>
				) : (
					<p className="text-center py-8 text-muted-foreground">No projects yet</p>
				)}
			</CardContent>
		</Card>
	);
}
