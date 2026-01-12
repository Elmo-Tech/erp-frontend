/**
 * Project Bounce Rate Chart
 * Requirement 15.3: Show bounce rate by project comparison
 */

"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ProjectBounceRate } from "../../types";

interface ProjectBounceChartProps {
	projects: ProjectBounceRate[];
}

export function ProjectBounceChart({ projects }: ProjectBounceChartProps) {
	const chartData = useMemo(() => {
		return projects.slice(0, 10).map((project) => ({
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
}
