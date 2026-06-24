"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban, AlertCircle, ArrowRight } from "lucide-react";
import { useClientProjects } from "../hooks/useClientProjects";
import { ClientProjectCard } from "./ClientProjectCard";

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

export const ClientDashboard: React.FC = () => {
	const { data: projectsData, isLoading: isLoadingProjects, error: projectsError } = useClientProjects({ perPage: 6 });

	return (
		<div className="space-y-8">
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Projects</CardTitle>
						<FolderKanban className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>{isLoadingProjects ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{projectsData?.pagination.total || 0}</div>}</CardContent>
				</Card>
			</div>

			<section>
				<div className="flex items-center justify-between mb-4">
					<div>
						<h2 className="text-xl font-semibold">Your Projects</h2>
						<p className="text-sm text-muted-foreground">Track progress on your active projects</p>
					</div>
					<Link href="/client/projects">
						<Button
							variant="outline"
							size="sm"
							className="gap-1"
						>
							View All
							<ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
				</div>

				{projectsError ? (
					<Card className="border-red-200">
						<CardContent className="flex items-center gap-2 py-6 text-red-600">
							<AlertCircle className="h-5 w-5" />
							<span>Failed to load projects. Please try again later.</span>
						</CardContent>
					</Card>
				) : isLoadingProjects ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
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
			</section>
		</div>
	);
};
