/**
 * UserPerformanceCard Component
 * Displays individual employee performance metrics in a card format
 * for quick assessment of team productivity.
 *
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */

"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, Target, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, User, ExternalLink } from "lucide-react";
import { UserPerformance } from "../types";
import { cn } from "@/lib/utils";

/**
 * Props for UserPerformanceCard component
 */
interface UserPerformanceCardProps {
	user: UserPerformance;
	className?: string;
	showDetailLink?: boolean;
	detailLinkHref?: string;
}

/**
 * Utility function to format minutes to human readable time
 */
const formatMinutes = (minutes: number): string => {
	if (minutes < 60) {
		return `${minutes}m`;
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (hours < 24) {
		return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
	}

	const days = Math.floor(hours / 24);
	const remainingHours = hours % 24;

	if (remainingHours > 0) {
		return `${days}d ${remainingHours}h`;
	}

	return `${days}d`;
};

/**
 * Utility function to get user initials for avatar fallback
 */
const getUserInitials = (name: string): string => {
	return name
		.split(" ")
		.map((part) => part.charAt(0))
		.join("")
		.toUpperCase()
		.slice(0, 2);
};

/**
 * Utility function to determine if a metric is concerning
 */
const getMetricStatus = (value: number, type: "idle" | "bounce" | "completion"): "good" | "warning" | "danger" => {
	switch (type) {
		case "idle":
			// Idle time percentage (assuming 8 hour work day = 480 minutes)
			const idlePercentage = (value / 480) * 100;
			if (idlePercentage > 30) return "danger";
			if (idlePercentage > 15) return "warning";
			return "good";

		case "bounce":
			// Bounce rate percentage
			if (value > 20) return "danger";
			if (value > 10) return "warning";
			return "good";

		case "completion":
			// Task completion rate percentage
			if (value < 70) return "danger";
			if (value < 85) return "warning";
			return "good";

		default:
			return "good";
	}
};

/**
 * Utility function to get status color classes
 */
const getStatusColor = (status: "good" | "warning" | "danger") => {
	switch (status) {
		case "good":
			return "text-green-600";
		case "warning":
			return "text-yellow-600";
		case "danger":
			return "text-red-600";
		default:
			return "text-muted-foreground";
	}
};

/**
 * Utility function to get badge variant based on status
 */
const getBadgeVariant = (status: "good" | "warning" | "danger") => {
	switch (status) {
		case "good":
			return "default";
		case "warning":
			return "secondary";
		case "danger":
			return "destructive";
		default:
			return "outline";
	}
};

/**
 * UserPerformanceCard Component
 *
 * Requirement 13.1: Display user name, avatar, metrics
 * Requirement 13.2: Use visual indicators (progress bars, badges) for metrics
 * Requirement 13.3: Highlight concerning metrics (high idle time, high bounce rate) in red
 * Requirement 13.4: Link to detailed user performance view
 * Requirement 13.5: Do NOT display internal hourly cost (even to Super Admin in this view)
 */
export const UserPerformanceCard: React.FC<UserPerformanceCardProps> = ({ user, className, showDetailLink = true, detailLinkHref }) => {
	// Calculate derived metrics
	const totalMinutes = user.totalTrackedMinutes + user.totalIdleMinutes;
	const idlePercentage = totalMinutes > 0 ? (user.totalIdleMinutes / totalMinutes) * 100 : 0;
	const trackedPercentage = totalMinutes > 0 ? (user.totalTrackedMinutes / totalMinutes) * 100 : 0;

	// Determine metric statuses for highlighting concerning values
	const idleStatus = getMetricStatus(user.totalIdleMinutes, "idle");
	const bounceStatus = getMetricStatus(user.averageBounceRate, "bounce");
	const completionStatus = getMetricStatus(user.taskCompletionRate, "completion");

	// Generate detail link href if not provided
	const detailHref = detailLinkHref || `/dashboard/admin/users/${user.userId}/performance`;

	return (
		<Card className={cn("hover:shadow-md transition-shadow", className)}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						{/* Requirement 13.1: Display user avatar */}
						<Avatar className="h-10 w-10">
							<AvatarImage
								src={user.avatar}
								alt={user.name}
							/>
							<AvatarFallback>
								<User className="h-4 w-4" />
								{getUserInitials(user.name)}
							</AvatarFallback>
						</Avatar>

						<div>
							{/* Requirement 13.1: Display user name */}
							<CardTitle className="text-base font-semibold">{user.name}</CardTitle>
							<p className="text-sm text-muted-foreground">{user.email}</p>
						</div>
					</div>

					{/* Requirement 13.4: Link to detailed performance view */}
					{showDetailLink && (
						<Button
							variant="ghost"
							size="sm"
							asChild
						>
							<Link href={detailHref}>
								<ExternalLink className="h-4 w-4" />
							</Link>
						</Button>
					)}
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Time Tracking Metrics */}
				<div className="space-y-3">
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center space-x-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<span>Time Tracked</span>
						</div>
						<span className="font-medium">{formatMinutes(user.totalTrackedMinutes)}</span>
					</div>

					{/* Requirement 13.2: Use progress bars for visualization */}
					<Progress
						value={trackedPercentage}
						className="h-2"
					/>

					<div className="flex justify-between text-xs text-muted-foreground">
						<span>Tracked: {trackedPercentage.toFixed(1)}%</span>
						<span
							className={cn(
								"font-medium",
								// Requirement 13.3: Highlight concerning metrics in red
								getStatusColor(idleStatus)
							)}
						>
							Idle: {idlePercentage.toFixed(1)}%
						</span>
					</div>
				</div>

				{/* Task Performance Metrics */}
				<div className="grid grid-cols-2 gap-4">
					{/* Task Completion Rate */}
					<div className="space-y-2">
						<div className="flex items-center space-x-1">
							<Target className="h-3 w-3 text-muted-foreground" />
							<span className="text-xs text-muted-foreground">Completion</span>
						</div>

						<div className="flex items-center space-x-2">
							<span
								className={cn(
									"text-lg font-bold",
									// Requirement 13.3: Highlight concerning metrics in red
									getStatusColor(completionStatus)
								)}
							>
								{user.taskCompletionRate.toFixed(1)}%
							</span>
							{completionStatus === "good" && <CheckCircle className="h-4 w-4 text-green-600" />}
							{completionStatus === "warning" && <TrendingDown className="h-4 w-4 text-yellow-600" />}
							{completionStatus === "danger" && <AlertTriangle className="h-4 w-4 text-red-600" />}
						</div>

						<p className="text-xs text-muted-foreground">
							{user.completedTasks}/{user.totalTasks} tasks
						</p>
					</div>

					{/* Bounce Rate */}
					<div className="space-y-2">
						<div className="flex items-center space-x-1">
							<TrendingUp className="h-3 w-3 text-muted-foreground" />
							<span className="text-xs text-muted-foreground">Bounce Rate</span>
						</div>

						<div className="flex items-center space-x-2">
							<span
								className={cn(
									"text-lg font-bold",
									// Requirement 13.3: Highlight concerning metrics in red
									getStatusColor(bounceStatus)
								)}
							>
								{user.averageBounceRate.toFixed(1)}%
							</span>
							{bounceStatus === "good" && <CheckCircle className="h-4 w-4 text-green-600" />}
							{bounceStatus === "warning" && <TrendingUp className="h-4 w-4 text-yellow-600" />}
							{bounceStatus === "danger" && <AlertTriangle className="h-4 w-4 text-red-600" />}
						</div>

						<p className="text-xs text-muted-foreground">Quality metric</p>
					</div>
				</div>

				{/* Attendance Summary */}
				<div className="pt-2 border-t">
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Attendance Days</span>
						<Badge variant={user.attendanceDays >= 20 ? "default" : user.attendanceDays >= 15 ? "secondary" : "destructive"}>{user.attendanceDays} days</Badge>
					</div>
				</div>

				{/* Performance Summary Badges */}
				<div className="flex flex-wrap gap-2 pt-2">
					{/* Requirement 13.2: Use badges for visualization */}
					<Badge variant={getBadgeVariant(completionStatus)}>
						{completionStatus === "good" && "High Performer"}
						{completionStatus === "warning" && "Average"}
						{completionStatus === "danger" && "Needs Support"}
					</Badge>

					{idleStatus === "danger" && <Badge variant="destructive">High Idle Time</Badge>}

					{bounceStatus === "danger" && <Badge variant="destructive">Quality Issues</Badge>}

					{idleStatus === "good" && bounceStatus === "good" && completionStatus === "good" && <Badge variant="default">Excellent</Badge>}
				</div>
			</CardContent>
		</Card>
	);
};

export default UserPerformanceCard;
