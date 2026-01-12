/**
 * QualityDashboard Component
 * Dedicated view for quality metrics including bounce rate trends,
 * top bouncing tasks, bounce rate by project and developer comparisons.
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Filter, AlertTriangle, Calendar, Users } from "lucide-react";
import { useQualityMetrics } from "../../hooks/useAdminStats";
import { QualityFilters } from "../../types";

import { DateRangePicker } from "./DateRangePicker";
import { TopBouncingTasks } from "./TopBouncingTasks";
import { ProjectBounceChart } from "./ProjectBounceChart";
import { DeveloperBounceChart } from "./DeveloperBounceChart";
import { QualityDashboardSkeleton } from "./QualityDashboardSkeleton";
import { MetricsCards } from "./MetricsCards";

interface QualityDashboardProps {
	initialFilters?: QualityFilters;
}

export function QualityDashboard({ initialFilters }: QualityDashboardProps) {
	const [filters, setFilters] = useState<QualityFilters>(initialFilters || {});
	const [showFilters, setShowFilters] = useState(false);

	const { data, isLoading, error } = useQualityMetrics(filters);

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

	const handleTaskClick = (taskId: number) => {
		console.log(`Navigate to task ${taskId}`);
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
			<MetricsCards
				overallBounceRate={data.overallBounceRate}
				qualityScore={data.qualityScore}
				totalBounces={data.totalBounces}
				tasksWithBounces={data.tasksWithBounces}
			/>

			{/* Charts */}
			<div className="grid gap-6 lg:grid-cols-2">
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

			{/* Top Bouncing Tasks */}
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
}

export default QualityDashboard;
