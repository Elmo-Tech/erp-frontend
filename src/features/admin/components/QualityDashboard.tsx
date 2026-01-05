/**
 * QualityDashboard Component
 * Dedicated view for quality metrics including bounce rate trends,
 * top bouncing tasks, bounce rate by project and developer comparisons.
 *
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6
 */

"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DatePicker } from "@/components/shared/forms/DatePicker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle, Filter, ExternalLink, Calendar, Users, Target } from "lucide-react";
import { useQualityMetrics } from "../hooks/useAdminStats";
import { QualityFilters, BouncingTask, DeveloperBounceRate, ProjectBounceRate } from "../types";

interface QualityDashboardProps {
	/**
	 * Optional initial filters
	 */
	initialFilters?: QualityFilters;
}

/**
 * Date range picker component for filtering
 */
interface DateRangePickerProps {
	dateFrom?: string;
	dateTo?: string;
	onDateFromChange: (date: string) => void;
	onDateToChange: (date: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ dateFrom, dateTo, onDateFromChange, onDateToChange }) => {
	return (
		<div className="flex flex-col sm:flex-row gap-2">
			<div className="flex-1">
				<Label
					htmlFor="dateFrom"
					className="text-xs"
				>
					From
				</Label>
				<DatePicker
					value={dateFrom || ""}
					onChange={onDateFromChange}
					placeholder="Select date"
				/>
			</div>
			<div className="flex-1">
				<Label
					htmlFor="dateTo"
					className="text-xs"
				>
					To
				</Label>
				<DatePicker
					value={dateTo || ""}
					onChange={onDateToChange}
					placeholder="Select date"
				/>
			</div>
		</div>
	);
};

/**
 * Top bouncing tasks table component
 * Requirement 15.2: List top 10 bouncing tasks
 */
interface TopBouncingTasksProps {
	tasks: BouncingTask[];
	onTaskClick?: (taskId: number) => void;
}

const TopBouncingTasks: React.FC<TopBouncingTasksProps> = ({ tasks, onTaskClick }) => {
	if (!tasks.length) {
		return (
			<div className="flex items-center justify-center h-32 text-muted-foreground">
				<CheckCircle className="h-8 w-8 mr-2" />
				No bouncing tasks found
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{tasks.slice(0, 10).map((task, index) => (
				<div
					key={task.taskId}
					className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
				>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<Badge
								variant="outline"
								className="text-xs"
							>
								#{index + 1}
							</Badge>
							<h4 className="font-medium text-sm truncate">{task.title}</h4>
						</div>
						<div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
							<span>Project: {task.projectTitle}</span>
							<span>Assigned to: {task.assignedTo}</span>
							<Badge variant={task.status === "completed" ? "default" : task.status === "in_progress" ? "secondary" : "destructive"}>{task.status}</Badge>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Badge
							variant="destructive"
							className="text-xs"
						>
							{task.reopenCount} bounces
						</Badge>
						{onTaskClick && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onTaskClick(task.taskId)}
								className="h-8 w-8 p-0"
							>
								<ExternalLink className="h-3 w-3" />
							</Button>
						)}
					</div>
				</div>
			))}
		</div>
	);
};

/**
 * Bounce rate by project chart
 * Requirement 15.3: Show bounce rate by project comparison
 */
interface ProjectBounceChartProps {
	projects: ProjectBounceRate[];
}

const ProjectBounceChart: React.FC<ProjectBounceChartProps> = ({ projects }) => {
	const chartData = useMemo(() => {
		return projects
			.slice(0, 10) // Show top 10 projects
			.map((project) => ({
				name: project.title.length > 15 ? `${project.title.substring(0, 15)}...` : project.title,
				bounceRate: project.averageBounceRate,
				totalBounces: project.totalBounces,
				totalTasks: project.totalTasks,
			}));
	}, [projects]);

	if (!chartData.length) {
		return <div className="flex items-center justify-center h-64 text-muted-foreground">No project data available</div>;
	}

	return (
		<ResponsiveContainer
			width="100%"
			height={300}
		>
			<BarChart
				data={chartData}
				margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
			>
				<CartesianGrid
					strokeDasharray="3 3"
					className="opacity-30"
				/>
				<XAxis
					dataKey="name"
					angle={-45}
					textAnchor="end"
					height={80}
					interval={0}
					fontSize={11}
				/>
				<YAxis fontSize={11} />
				<Tooltip
					content={({ active, payload, label }) => {
						if (active && payload && payload.length) {
							const data = payload[0].payload;
							return (
								<div className="bg-background border border-border rounded-lg p-3 shadow-lg">
									<p className="font-medium mb-2">{label}</p>
									<div className="space-y-1 text-sm">
										<p>Bounce Rate: {data.bounceRate.toFixed(2)}</p>
										<p>Total Bounces: {data.totalBounces}</p>
										<p>Total Tasks: {data.totalTasks}</p>
									</div>
								</div>
							);
						}
						return null;
					}}
				/>
				<Bar
					dataKey="bounceRate"
					fill="#ef4444"
					radius={[2, 2, 0, 0]}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
};

/**
 * Bounce rate by developer chart
 * Requirement 15.4: Show bounce rate by developer
 */
interface DeveloperBounceChartProps {
	developers: DeveloperBounceRate[];
}

const DeveloperBounceChart: React.FC<DeveloperBounceChartProps> = ({ developers }) => {
	const chartData = useMemo(() => {
		return developers
			.slice(0, 8) // Show top 8 developers
			.map((dev) => ({
				name: dev.name.length > 12 ? `${dev.name.substring(0, 12)}...` : dev.name,
				bounceRate: dev.averageBounceRate,
				totalBounces: dev.totalBounces,
				totalTasks: dev.totalTasks,
			}));
	}, [developers]);

	if (!chartData.length) {
		return <div className="flex items-center justify-center h-64 text-muted-foreground">No developer data available</div>;
	}

	// Colors for pie chart
	const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"];

	return (
		<ResponsiveContainer
			width="100%"
			height={300}
		>
			<PieChart>
				<Pie
					data={chartData}
					cx="50%"
					cy="50%"
					labelLine={false}
					label={({ name, bounceRate }) => `${name}: ${bounceRate.toFixed(1)}`}
					outerRadius={80}
					fill="#8884d8"
					dataKey="bounceRate"
				>
					{chartData.map((entry, index) => (
						<Cell
							key={`cell-${index}`}
							fill={COLORS[index % COLORS.length]}
						/>
					))}
				</Pie>
				<Tooltip
					content={({ active, payload }) => {
						if (active && payload && payload.length) {
							const data = payload[0].payload;
							return (
								<div className="bg-background border border-border rounded-lg p-3 shadow-lg">
									<p className="font-medium mb-2">{data.name}</p>
									<div className="space-y-1 text-sm">
										<p>Bounce Rate: {data.bounceRate.toFixed(2)}</p>
										<p>Total Bounces: {data.totalBounces}</p>
										<p>Total Tasks: {data.totalTasks}</p>
									</div>
								</div>
							);
						}
						return null;
					}}
				/>
			</PieChart>
		</ResponsiveContainer>
	);
};

/**
 * Loading skeleton for the quality dashboard
 */
const QualityDashboardSkeleton: React.FC = () => (
	<div className="space-y-6">
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<Card key={i}>
					<CardHeader>
						<Skeleton className="h-4 w-24" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-8 w-16 mb-2" />
						<Skeleton className="h-3 w-20" />
					</CardContent>
				</Card>
			))}
		</div>
		<div className="grid gap-4 lg:grid-cols-2">
			<Skeleton className="h-[400px]" />
			<Skeleton className="h-[400px]" />
		</div>
	</div>
);

/**
 * QualityDashboard Component
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6
 */
export const QualityDashboard: React.FC<QualityDashboardProps> = ({ initialFilters }) => {
	// State for filters
	const [filters, setFilters] = useState<QualityFilters>(initialFilters || {});
	const [showFilters, setShowFilters] = useState(false);

	// Fetch quality metrics data
	const { data, isLoading, error } = useQualityMetrics(filters);

	// Handle filter changes
	const handleDateFromChange = (dateFrom: string) => {
		setFilters((prev) => ({ ...prev, dateFrom: dateFrom || undefined }));
	};

	const handleDateToChange = (dateTo: string) => {
		setFilters((prev) => ({ ...prev, dateTo: dateTo || undefined }));
	};

	const handleProjectChange = (projectId: string) => {
		setFilters((prev) => ({
			...prev,
			projectId: projectId === "all" ? undefined : parseInt(projectId),
		}));
	};

	const clearFilters = () => {
		setFilters({});
	};

	// Requirement 15.6: Provide drill-down to task details
	const handleTaskClick = (taskId: number) => {
		// This would typically navigate to task details page
		// For now, we'll just log it
		console.log(`Navigate to task ${taskId}`);
		// In a real app: router.push(`/dashboard/tasks/${taskId}`);
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="container mx-auto p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Quality Dashboard</h1>
					<p className="text-muted-foreground">Monitor code quality and bug bounce rates</p>
				</div>
				<QualityDashboardSkeleton />
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="container mx-auto p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Quality Dashboard</h1>
					<p className="text-muted-foreground">Monitor code quality and bug bounce rates</p>
				</div>
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>Failed to load quality data: {error.message}</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="container mx-auto p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Quality Dashboard</h1>
					<p className="text-muted-foreground">Monitor code quality and bug bounce rates</p>
				</div>
				<div className="flex items-center justify-center h-[400px] text-muted-foreground">No quality data available</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">Quality Dashboard</h1>
					<p className="text-muted-foreground">Monitor code quality and bug bounce rates</p>
				</div>

				{/* Requirement 15.5: Support date range and project filtering */}
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowFilters(!showFilters)}
						className="flex items-center gap-2"
					>
						<Filter className="h-4 w-4" />
						Filters
					</Button>
					{(filters.dateFrom || filters.dateTo || filters.projectId) && (
						<Button
							variant="ghost"
							size="sm"
							onClick={clearFilters}
						>
							Clear
						</Button>
					)}
				</div>
			</div>

			{/* Filters Panel */}
			{showFilters && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							Filters
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-2">
							<DateRangePicker
								dateFrom={filters.dateFrom}
								dateTo={filters.dateTo}
								onDateFromChange={handleDateFromChange}
								onDateToChange={handleDateToChange}
							/>
							<div>
								<Label
									htmlFor="project"
									className="text-xs"
								>
									Project
								</Label>
								<Select
									value={filters.projectId?.toString() || "all"}
									onValueChange={handleProjectChange}
								>
									<SelectTrigger>
										<SelectValue placeholder="All projects" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Projects</SelectItem>
										{data.bounceRateByProject.map((project) => (
											<SelectItem
												key={project.projectId}
												value={project.projectId.toString()}
											>
												{project.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Key Metrics Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Overall Bounce Rate</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.overallBounceRate.toFixed(2)}</div>
						<p className="text-xs text-muted-foreground">Average bounces per task</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Quality Score</CardTitle>
						<Target className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold flex items-center gap-2">
							{data.qualityScore.toFixed(1)}
							<Badge variant={data.qualityScore >= 8 ? "default" : data.qualityScore >= 6 ? "secondary" : "destructive"}>{data.qualityScore >= 8 ? "Excellent" : data.qualityScore >= 6 ? "Good" : "Poor"}</Badge>
						</div>
						<p className="text-xs text-muted-foreground">Inverse of bounce rate</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total Bounces</CardTitle>
						<AlertTriangle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.totalBounces}</div>
						<p className="text-xs text-muted-foreground">Across all tasks</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Tasks with Bounces</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.tasksWithBounces}</div>
						<p className="text-xs text-muted-foreground">Tasks that bounced back</p>
					</CardContent>
				</Card>
			</div>

			{/* Charts and Lists */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Requirement 15.3: Show bounce rate by project comparison */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BarChart className="h-4 w-4" />
							Bounce Rate by Project
						</CardTitle>
						<p className="text-sm text-muted-foreground">Compare bounce rates across projects</p>
					</CardHeader>
					<CardContent>
						<ProjectBounceChart projects={data.bounceRateByProject} />
					</CardContent>
				</Card>

				{/* Requirement 15.4: Show bounce rate by developer */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							Bounce Rate by Developer
						</CardTitle>
						<p className="text-sm text-muted-foreground">Developer performance comparison</p>
					</CardHeader>
					<CardContent>
						<DeveloperBounceChart developers={data.bounceRateByDeveloper} />
					</CardContent>
				</Card>
			</div>

			{/* Requirement 15.2: List top 10 bouncing tasks */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertTriangle className="h-4 w-4" />
						Top Bouncing Tasks
					</CardTitle>
					<p className="text-sm text-muted-foreground">Tasks with the highest bounce rates requiring attention</p>
				</CardHeader>
				<CardContent>
					<TopBouncingTasks
						tasks={data.topBouncingTasks}
						onTaskClick={handleTaskClick}
					/>
				</CardContent>
			</Card>
		</div>
	);
};

export default QualityDashboard;
