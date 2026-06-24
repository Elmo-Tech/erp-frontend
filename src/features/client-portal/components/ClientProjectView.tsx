"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowLeft, AlertCircle, TimerReset, Activity } from "lucide-react";
import { useClientProject } from "../hooks/useClientProjects";
import { ProgressBar } from "./ProgressBar";
import { cn } from "@/lib/utils";

interface ClientProjectViewProps {
	/** Project ID to display */
	projectId: number;
}

/**
 * Get status badge color based on project status
 */
const getStatusBadgeColor = (status: string): string => {
	const colors: Record<string, string> = {
		draft: "bg-gray-100 text-gray-800 border-gray-200",
		active: "bg-blue-100 text-blue-800 border-blue-200",
		ui_ux: "bg-purple-100 text-purple-800 border-purple-200",
		development: "bg-yellow-100 text-yellow-800 border-yellow-200",
		testing: "bg-orange-100 text-orange-800 border-orange-200",
		completed: "bg-green-100 text-green-800 border-green-200",
		on_hold: "bg-amber-100 text-amber-800 border-amber-200",
		cancelled: "bg-red-100 text-red-800 border-red-200",
	};
	return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

/**
 * Format date string to readable format
 */
const formatDate = (dateString: string): string => {
	if (!dateString) return "-";
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
};

/**
 * Loading skeleton for project view
 */
const ProjectViewSkeleton: React.FC = () => (
	<div className="space-y-6">
		<div className="flex items-center gap-4">
			<Skeleton className="h-10 w-10" />
			<div className="space-y-2">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-4 w-32" />
			</div>
		</div>
		<Card>
			<CardContent className="pt-6 space-y-6">
				<div className="grid gap-4 md:grid-cols-3">
					<Skeleton className="h-20" />
					<Skeleton className="h-20" />
					<Skeleton className="h-20" />
				</div>
				<Skeleton className="h-8 w-full" />
			</CardContent>
		</Card>
	</div>
);

/**
 * ClientProjectView component for displaying detailed project information.
 * Shows project details and progress for the simplified client portal.
 *
 * Requirements: 14.1, 14.2, 14.3 - Display project details with progress.
 */
export const ClientProjectView: React.FC<ClientProjectViewProps> = ({ projectId }) => {
	const { data: project, isLoading, error } = useClientProject(projectId);

	if (isLoading) {
		return <ProjectViewSkeleton />;
	}

	if (error || !project) {
		return (
			<div className="space-y-6">
				<Link href="/client">
					<Button
						variant="ghost"
						size="sm"
						className="gap-2"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Dashboard
					</Button>
				</Link>
				<Card className="border-red-200">
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<AlertCircle className="h-12 w-12 text-red-500 mb-4" />
						<CardTitle className="text-lg mb-2">Project Not Found</CardTitle>
						<CardDescription>The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</CardDescription>
						<Link
							href="/client"
							className="mt-4"
						>
							<Button>Return to Dashboard</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== "completed";

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Link href="/client">
						<Button
							variant="ghost"
							size="icon"
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold">{project.title}</h1>
							<Badge className={cn("border", getStatusBadgeColor(project.status))}>{project.statusLabel}</Badge>
						</div>
						<p className="text-sm text-muted-foreground">Created on {formatDate(project.createdAt)}</p>
					</div>
				</div>
			</div>

			{/* Project Details Card */}
			<Card>
				<CardHeader>
					<CardTitle>Project Overview</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Stats Grid */}
					<div className="grid gap-4 md:grid-cols-3">
						{/* Deadline */}
						<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
							<Calendar className={cn("h-8 w-8", isOverdue ? "text-red-500" : "text-muted-foreground")} />
							<div>
								<p className="text-sm text-muted-foreground">Deadline</p>
								<p className={cn("font-semibold", isOverdue && "text-red-600")}>{formatDate(project.deadline)}</p>
								{isOverdue && <p className="text-xs text-red-600">Overdue</p>}
							</div>
						</div>

						{/* Timeline */}
						<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
							<TimerReset className="h-8 w-8 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">Started</p>
								<p className="font-semibold">{formatDate(project.createdAt)}</p>
							</div>
						</div>

						{/* Project Status */}
						<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
							<Activity className="h-8 w-8 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">Status</p>
								<p className="font-semibold">{project.statusLabel}</p>
							</div>
						</div>
					</div>

					{/* Progress Bar */}
					<div className="pt-4 border-t">
						<ProgressBar
							percentage={project.progressPercentage}
							showText={true}
							size="lg"
							label="Project Progress"
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default ClientProjectView;
