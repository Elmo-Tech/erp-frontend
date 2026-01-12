/**
 * Developer Bounce Rate Chart
 * Requirement 15.4: Show bounce rate by developer
 */

"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { DeveloperBounceRate } from "../../types";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"];

interface DeveloperBounceChartProps {
	developers: DeveloperBounceRate[];
}

export function DeveloperBounceChart({ developers }: DeveloperBounceChartProps) {
	const chartData = useMemo(() => {
		return developers.slice(0, 8).map((dev) => ({
			name: dev.name.length > 12 ? `${dev.name.substring(0, 12)}...` : dev.name,
			bounceRate: dev.averageBounceRate,
			totalBounces: dev.totalBounces,
			totalTasks: dev.totalTasks,
		}));
	}, [developers]);

	if (!chartData.length) {
		return <div className="flex items-center justify-center h-64 text-muted-foreground">No developer data available</div>;
	}

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
					{chartData.map((_, index) => (
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
}
