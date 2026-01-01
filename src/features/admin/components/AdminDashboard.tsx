/**
 * AdminDashboard Component
 * Overview dashboard showing key business metrics including revenue, profit,
 * project counts, team utilization, and quality score.
 *
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 18.2
 */

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, DollarSign, Target, Users, CheckCircle, Clock, AlertCircle, BarChart3, Activity } from "lucide-react";
import { useAdminOverview } from "../hooks/useAdminStats";
import { useAdminPermissions } from "../hooks";
import { ProfitChart } from "./ProfitChart";

/**
 * Metric card component for displaying key statistics
 */
interface MetricCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: React.ReactNode;
	trend?: "up" | "down" | "neutral";
	trendValue?: string;
	className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon, trend, trendValue, className = "" }) => {
	const getTrendIcon = () => {
		switch (trend) {
			case "up":
				return <TrendingUp className="h-4 w-4 text-green-600" />;
			case "down":
				return <TrendingDown className="h-4 w-4 text-red-600" />;
			default:
				return null;
		}
	};

	const getTrendColor = () => {
		switch (trend) {
			case "up":
				return "text-green-600";
			case "down":
				return "text-red-600";
			default:
				return "text-muted-foreground";
		}
	};

	return (
		<Card className={className}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
				<div className="text-muted-foreground">{icon}</div>
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				{subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
				{trend && trendValue && (
					<div className={`flex items-center gap-1 mt-2 text-xs ${getTrendColor()}`}>
						{getTrendIcon()}
						<span>{trendValue}</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

/**
 * Loading skeleton for the dashboard
 */
const DashboardSkeleton: React.FC = () => (
	<div className="space-y-6">
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<Card key={i}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-4" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-8 w-20 mb-2" />
						<Skeleton className="h-3 w-16" />
					</CardContent>
				</Card>
			))}
		</div>
		<div className="grid gap-4 md:grid-cols-2">
			<Skeleton className="h-[400px]" />
			<Skeleton className="h-[400px]" />
		</div>
	</div>
);

/**
 * AdminDashboard Component
 * Requirement 14.1-14.6: Display key business metrics at a glance
 * Requirement 18.2: Conditionally render profitability section based on permission
 */
export const AdminDashboard: React.FC = () => {
	const { data, isLoading, error } = useAdminOverview();
	const { canViewProfitability, canViewAdminStats } = useAdminPermissions();

	// Check if user has basic admin stats permission
	if (!canViewAdminStats) {
		return (
			<div className="container mx-auto p-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>You don&apos;t have permission to view admin statistics.</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Loading state
	if (isLoading) {
		return (
			<div className="container mx-auto p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Admin Dashboard</h1>
					<p className="text-muted-foreground">Business intelligence and key metrics overview</p>
				</div>
				<DashboardSkeleton />
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="container mx-auto p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Admin Dashboard</h1>
					<p className="text-muted-foreground">Business intelligence and key metrics overview</p>
				</div>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>Failed to load dashboard data: {error.message}</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="container mx-auto p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Admin Dashboard</h1>
					<p className="text-muted-foreground">Business intelligence and key metrics overview</p>
				</div>
				<div className="flex items-center justify-center h-[400px] text-muted-foreground">No dashboard data available</div>
			</div>
		);
	}

	// Calculate completion rate
	const totalProjects = data.activeProjects + data.completedProjects;
	const completionRate = totalProjects > 0 ? (data.completedProjects / totalProjects) * 100 : 0;

	// Determine profit trend
	const profitTrend = data.totalProfit > 0 ? "up" : data.totalProfit < 0 ? "down" : "neutral";
	const marginTrend = data.overallMargin > 10 ? "up" : data.overallMargin < 5 ? "down" : "neutral";

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
				<p className="text-muted-foreground">Business intelligence and key metrics overview</p>
			</div>

			{/* Key Metrics Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{/* Requirement 14.1: Display total revenue */}
				<MetricCard
					title="Total Revenue"
					value={`$${data.totalRevenue.toLocaleString()}`}
					subtitle="Sum of project budgets"
					icon={<DollarSign className="h-4 w-4" />}
				/>

				{/* Requirement 14.2: Display total profit and overall profit margin */}
				{canViewProfitability && (
					<>
						<MetricCard
							title="Total Profit"
							value={`$${data.totalProfit.toLocaleString()}`}
							subtitle="Revenue minus costs"
							icon={<Target className="h-4 w-4" />}
							trend={profitTrend}
							trendValue={`${data.overallMargin.toFixed(1)}% margin`}
						/>

						<MetricCard
							title="Profit Margin"
							value={`${data.overallMargin.toFixed(1)}%`}
							subtitle="Overall profitability"
							icon={<BarChart3 className="h-4 w-4" />}
							trend={marginTrend}
							trendValue={marginTrend === "up" ? "Healthy" : marginTrend === "down" ? "Needs attention" : "Stable"}
						/>
					</>
				)}

				{/* Requirement 14.3: Display active projects count and completion rate */}
				<MetricCard
					title="Active Projects"
					value={data.activeProjects}
					subtitle={`${data.completedProjects} completed`}
					icon={<Activity className="h-4 w-4" />}
					trendValue={`${completionRate.toFixed(1)}% completion rate`}
				/>
			</div>

			{/* Secondary Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{/* Requirement 14.4: Display team utilization metric */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
							<Users className="h-4 w-4" />
							Team Utilization
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>Utilization Rate</span>
								<span className="font-medium">{data.teamUtilization.toFixed(1)}%</span>
							</div>
							<Progress
								value={data.teamUtilization}
								className="h-2"
							/>
							<p className="text-xs text-muted-foreground">{data.teamUtilization >= 80 ? "High utilization" : data.teamUtilization >= 60 ? "Good utilization" : "Low utilization"}</p>
						</div>
					</CardContent>
				</Card>

				{/* Requirement 14.5: Display quality score */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
							<CheckCircle className="h-4 w-4" />
							Quality Score
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="text-2xl font-bold flex items-center gap-2">
								{data.qualityScore.toFixed(1)}
								<Badge variant={data.qualityScore >= 8 ? "default" : data.qualityScore >= 6 ? "secondary" : "destructive"}>{data.qualityScore >= 8 ? "Excellent" : data.qualityScore >= 6 ? "Good" : "Needs Improvement"}</Badge>
							</div>
							<Progress
								value={data.qualityScore * 10}
								className="h-2"
							/>
							<p className="text-xs text-muted-foreground">Based on bug bounce rates and task completion</p>
						</div>
					</CardContent>
				</Card>

				{/* Project Status Overview */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
							<Clock className="h-4 w-4" />
							Project Status
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm">Active</span>
								<Badge variant="secondary">{data.activeProjects}</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm">Completed</span>
								<Badge variant="default">{data.completedProjects}</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm">Total</span>
								<Badge variant="outline">{totalProjects}</Badge>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Charts Section */}
			{/* Requirement 18.2: Conditionally render profitability section based on permission */}
			{canViewProfitability && (
				<div className="grid gap-4 lg:grid-cols-1">
					<ProfitChart
						filters={{
							sortBy: "profit",
							sortDirection: "desc",
						}}
						maxProjects={8}
					/>
				</div>
			)}

			{/* Requirement 14.6: Refresh data periodically - handled by useAdminOverview hook */}
		</div>
	);
};

export default AdminDashboard;
