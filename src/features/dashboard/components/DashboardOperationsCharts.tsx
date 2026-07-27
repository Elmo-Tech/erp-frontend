"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { AdminDashboardStats } from "../types";

const projectChartConfig = {
	active: {
		label: "Active",
		color: "var(--chart-2)",
	},
	completed: {
		label: "Completed",
		color: "var(--chart-4)",
	},
	other: {
		label: "Other",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

const taskChartConfig = {
	count: {
		label: "Tasks",
		color: "var(--chart-3)",
	},
} satisfies ChartConfig;

interface DashboardOperationsChartsProps {
	stats: AdminDashboardStats;
}

export function DashboardOperationsCharts({ stats }: DashboardOperationsChartsProps) {
	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<ProjectPortfolioChart stats={stats} />
			<TaskAttentionChart stats={stats} />
		</div>
	);
}

function ProjectPortfolioChart({ stats }: DashboardOperationsChartsProps) {
	const projectData = [
		{ name: "active", value: stats.activeProjects, fill: "var(--color-active)" },
		{ name: "completed", value: stats.completedProjects, fill: "var(--color-completed)" },
		{ name: "other", value: Math.max(stats.totalProjects - stats.activeProjects - stats.completedProjects, 0), fill: "var(--color-other)" },
	].filter((portfolioSegment) => portfolioSegment.value > 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Project portfolio</CardTitle>
				<CardDescription>Current distribution across active, completed, and other projects</CardDescription>
			</CardHeader>
			<CardContent>
				{projectData.length > 0 ? (
					<div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_140px]">
						<ChartContainer config={projectChartConfig} className="h-[240px] w-full">
							<PieChart accessibilityLayer>
								<ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
								<Pie data={projectData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} strokeWidth={2}>
									{projectData.map((portfolioSegment) => <Cell key={portfolioSegment.name} fill={portfolioSegment.fill} />)}
								</Pie>
							</PieChart>
						</ChartContainer>
						<div className="space-y-3">
							{projectData.map((portfolioSegment) => (
								<div key={portfolioSegment.name} className="flex items-center justify-between gap-4 text-sm">
									<div className="flex items-center gap-2">
										<span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: portfolioSegment.fill }} />
										<span className="text-muted-foreground">{projectChartConfig[portfolioSegment.name as keyof typeof projectChartConfig].label}</span>
									</div>
									<span className="font-semibold tabular-nums">{portfolioSegment.value}</span>
								</div>
							))}
						</div>
					</div>
				) : (
					<div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">Project data will appear here once work begins</div>
				)}
			</CardContent>
		</Card>
	);
}

function TaskAttentionChart({ stats }: DashboardOperationsChartsProps) {
	const taskData = [
		{ metric: "Open", count: stats.openTasks },
		{ metric: "Overdue", count: stats.overdueTasks },
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Task attention</CardTitle>
				<CardDescription>Open workload compared with tasks that have passed their due date</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={taskChartConfig} className="h-[240px] w-full">
					<BarChart accessibilityLayer data={taskData} margin={{ left: 0, right: 12 }}>
						<CartesianGrid vertical={false} />
						<XAxis dataKey="metric" tickLine={false} axisLine={false} />
						<YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
						<ChartTooltip content={<ChartTooltipContent hideLabel />} />
						<Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} maxBarSize={72} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
