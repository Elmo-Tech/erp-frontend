/**
 * ProfitChart Component
 * Bar chart visualization comparing budget vs actual cost per project.
 * Uses Recharts for visualization with color coding and responsive design.
 *
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6
 */

"use client";

import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfitabilityData, ProfitabilityFilters } from "../types";
import { useProfitability } from "../hooks/useAdminStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ProfitChartProps {
	/**
	 * Date range and other filters for profitability data
	 * Requirement 12.4: Support date range filtering
	 */
	filters?: ProfitabilityFilters;
	/**
	 * Height of the chart in pixels
	 * Default: 400px
	 */
	height?: number;
	/**
	 * Whether to show the legend
	 * Default: true
	 */
	showLegend?: boolean;
	/**
	 * Maximum number of projects to display
	 * Default: 10 (for readability)
	 */
	maxProjects?: number;
}

/**
 * Chart data interface for Recharts
 */
interface ChartDataPoint {
	name: string;
	budget: number;
	actualCost: number;
	profit: number;
	profitMargin: number;
	isProfitable: boolean;
	projectId: number;
}

/**
 * Custom tooltip component showing detailed information
 * Requirement 12.5: Show profit margin on hover
 */
const CustomTooltip = ({ active, payload, label }: any) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload as ChartDataPoint;
		return (
			<div className="bg-background border border-border rounded-lg p-3 shadow-lg">
				<p className="font-medium text-foreground mb-2">{label}</p>
				<div className="space-y-1 text-sm">
					<p className="text-blue-600">Budget: ${data.budget.toLocaleString()}</p>
					<p className="text-orange-600">Actual Cost: ${data.actualCost.toLocaleString()}</p>
					<p className={data.isProfitable ? "text-green-600" : "text-red-600"}>Profit: ${data.profit.toLocaleString()}</p>
					<p className={data.isProfitable ? "text-green-600" : "text-red-600"}>Margin: {data.profitMargin.toFixed(1)}%</p>
				</div>
			</div>
		);
	}
	return null;
};

/**
 * ProfitChart Component
 * Requirement 12.1: Display bar chart comparing budget vs actual cost per project
 * Requirement 12.2: Color code: green for profitable, red for unprofitable projects
 * Requirement 12.6: Make responsive for mobile
 */
export const ProfitChart: React.FC<ProfitChartProps> = ({ filters, height = 400, showLegend = true, maxProjects = 10 }) => {
	// Fetch profitability data
	const { data, isLoading, error } = useProfitability(filters);

	// Transform data for chart
	const chartData = useMemo(() => {
		if (!data?.projects) return [];

		return data.projects
			.slice(0, maxProjects) // Limit number of projects for readability
			.map(
				(project: ProfitabilityData): ChartDataPoint => ({
					name: project.title.length > 20 ? `${project.title.substring(0, 20)}...` : project.title,
					budget: project.budget,
					actualCost: project.totalCost,
					profit: project.profit,
					profitMargin: project.profitMargin,
					isProfitable: project.profit >= 0,
					projectId: project.projectId,
				})
			);
	}, [data?.projects, maxProjects]);

	// Loading state
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Project Profitability</CardTitle>
				</CardHeader>
				<CardContent>
					<Skeleton className="w-full h-[400px]" />
				</CardContent>
			</Card>
		);
	}

	// Error state
	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Project Profitability</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>Failed to load profitability data: {error.message}</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	// No data state
	if (!chartData.length) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Project Profitability</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-[400px] text-muted-foreground">No profitability data available</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Project Profitability</CardTitle>
				<p className="text-sm text-muted-foreground">Budget vs Actual Cost comparison across projects</p>
			</CardHeader>
			<CardContent>
				{/* Requirement 12.6: Responsive container for mobile */}
				<ResponsiveContainer
					width="100%"
					height={height}
				>
					<BarChart
						data={chartData}
						margin={{
							top: 20,
							right: 30,
							left: 20,
							bottom: 60, // Extra space for rotated labels on mobile
						}}
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
							fontSize={12}
							className="text-muted-foreground"
						/>
						<YAxis
							tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
							fontSize={12}
							className="text-muted-foreground"
						/>
						<Tooltip content={<CustomTooltip />} />
						{showLegend && (
							<Legend
								wrapperStyle={{ paddingTop: "20px" }}
								iconType="rect"
							/>
						)}

						{/* Budget bars */}
						<Bar
							dataKey="budget"
							name="Budget"
							fill="#3b82f6" // Blue color
							radius={[2, 2, 0, 0]}
						/>

						{/* Actual cost bars with conditional coloring */}
						<Bar
							dataKey="actualCost"
							name="Actual Cost"
							radius={[2, 2, 0, 0]}
						>
							{/* Requirement 12.2: Color code based on profitability */}
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={entry.isProfitable ? "#10b981" : "#ef4444"} // Green for profitable, red for unprofitable
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>

				{/* Legend explanation for mobile users */}
				<div className="mt-4 text-xs text-muted-foreground space-y-1 md:hidden">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-blue-500 rounded"></div>
						<span>Budget</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-green-500 rounded"></div>
						<span>Profitable (Actual Cost)</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-red-500 rounded"></div>
						<span>Unprofitable (Actual Cost)</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default ProfitChart;
