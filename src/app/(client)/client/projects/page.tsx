"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { FolderKanban, AlertCircle } from "lucide-react";
import { useClientProjects } from "@/_old/features/client-portal/hooks/useClientProjects";
import { ClientProjectCard } from "@/_old/features/client-portal/components/ClientProjectCard";

/**
 * Loading skeleton for project cards
 */
const ProjectCardSkeleton: React.FC = () => (
	<Card>
		<CardHeader className="pb-2">
			<div className="flex items-start justify-between">
				<Skeleton className="h-6 w-48" />
				<Skeleton className="h-5 w-20" />
			</div>
		</CardHeader>
		<CardContent className="space-y-4">
			<div className="space-y-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-2 w-full" />
			</div>
			<div className="flex justify-between">
				<Skeleton className="h-4 w-28" />
				<Skeleton className="h-4 w-20" />
			</div>
		</CardContent>
	</Card>
);

/**
 * Client Projects Page
 * Route: /client/projects
 * Displays all client projects with progress bars and links to details.
 *
 * Requirements: 9.1 - Display client projects list
 */
export default function ClientProjectsPage() {
	const { data: projectsData, isLoading, error } = useClientProjects();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">My Projects</h1>
				<p className="text-muted-foreground">View and track your project progress</p>
			</div>

			{error ? (
				<Card className="border-red-200">
					<CardContent className="flex items-center gap-2 py-6 text-red-600">
						<AlertCircle className="h-5 w-5" />
						<span>Failed to load projects. Please try again later.</span>
					</CardContent>
				</Card>
			) : isLoading ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<ProjectCardSkeleton key={i} />
					))}
				</div>
			) : projectsData?.projects.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
						<CardTitle className="text-lg mb-2">No Projects Yet</CardTitle>
						<CardDescription>You don&apos;t have any projects at the moment.</CardDescription>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{projectsData?.projects.map((project) => (
						<ClientProjectCard
							key={project.projectId}
							project={project}
						/>
					))}
				</div>
			)}
		</div>
	);
}
