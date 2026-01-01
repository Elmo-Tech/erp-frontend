"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, ArrowRight } from "lucide-react";
import { ClientProject } from "../types/clientProject";
import { ProgressBar } from "./ProgressBar";
import { cn } from "@/lib/utils";

interface ClientProjectCardProps {
	/** Project data */
	project: ClientProject;
	/** Additional CSS classes */
	className?: string;
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
	if (!dateString) return "No deadline";
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

/**
 * Format currency amount
 */
const formatCurrency = (amount: number, currency: string): string => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency || "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
};

/**
 * ClientProjectCard component for displaying project summary in client portal.
 * Shows project title, status, progress bar, and deadline with link to details.
 *
 * Requirements: 13.1, 13.4 - Display project with progress bar and link to details
 */
export const ClientProjectCard: React.FC<ClientProjectCardProps> = ({ project, className = "" }) => {
	const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== "completed";

	return (
		<Link href={`/client/projects/${project.projectId}`}>
			<Card className={cn("hover:shadow-md transition-shadow cursor-pointer group", isOverdue && "border-red-200", className)}>
				<CardHeader className="pb-2">
					<div className="flex items-start justify-between gap-2">
						<CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">{project.title}</CardTitle>
						<Badge className={cn("shrink-0 border", getStatusBadgeColor(project.status))}>{project.statusLabel}</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Progress Bar */}
					<ProgressBar
						percentage={project.progressPercentage}
						showText={true}
						size="md"
						label="Progress"
					/>

					{/* Project Details */}
					<div className="flex items-center justify-between text-sm text-muted-foreground">
						<div className="flex items-center gap-1.5">
							<Calendar className="h-4 w-4" />
							<span className={cn(isOverdue && "text-red-600 font-medium")}>{formatDate(project.deadline)}</span>
						</div>
						<div className="flex items-center gap-1.5">
							<DollarSign className="h-4 w-4" />
							<span>{formatCurrency(project.budget, project.currency)}</span>
						</div>
					</div>

					{/* View Details Link */}
					<div className="flex items-center justify-end text-sm text-primary font-medium group-hover:underline">
						View Details
						<ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
					</div>
				</CardContent>
			</Card>
		</Link>
	);
};

export default ClientProjectCard;
