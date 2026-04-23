/**
 * RejectionReasonsChart Component
 * Pie chart showing why deals are lost (Price vs Competitor vs Other reasons)
 * Uses Recharts for visualization with responsive design.
 *
 * Requirements: FE-Pack 3 - Rejection Analysis visualization
 */

"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { AlertCircle, PieChart as PieChartIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/_old/features/sales/api/analytics";

interface RejectionReasonsChartProps {
	dateRange: {
		startDate: string;
		endDate: string;
	};
	refreshKey: number;
	height?: number;
}

interface RejectionData {
	reason: string;
	count: number;
	percentage: number;
	color: string;
}

interface TooltipPayloadEntry<T> {
	payload: T;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: TooltipPayloadEntry<RejectionData>[];
}

interface CustomLabelProps {
	cx: number;
	cy: number;
	midAngle: number;
	innerRadius: number;
	outerRadius: number;
	percentage: number;
}

/**
 * Predefined colors for rejection reasons
 */
const REJECTION_COLORS = [
	"#ef4444", // Red - Price too high
	"#f97316", // Orange - Competitor chosen
	"#eab308", // Yellow - Timeline issues
	"#84cc16", // Lime - Budget constraints
	"#06b6d4", // Cyan - Feature requirements
	"#8b5cf6", // Purple - Other
	"#ec4899", // Pink - No response
	"#6b7280", // Gray - Unknown
];

/**
 * Custom tooltip component showing detailed information
 */
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload as RejectionData;
		return (
			<div className="bg-background border border-border rounded-lg p-3 shadow-lg">
				<p className="font-medium text-foreground mb-2">{data.reason}</p>
				<div className="space-y-1 text-sm">
					<p className="text-blue-600">Count: {data.count.toLocaleString()}</p>
					<p className="text-green-600">Percentage: {data.percentage.toFixed(1)}%</p>
				</div>
			</div>
		);
	}
	return null;
};

/**
 * Custom label function for pie chart
 */
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: CustomLabelProps) => {
	if (percentage < 5) return null; // Don't show labels for small slices

	const RADIAN = Math.PI / 180;
	const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
	const x = cx + radius * Math.cos(-midAngle * RADIAN);
	const y = cy + radius * Math.sin(-midAngle * RADIAN);

	return (
		<text
			x={x}
			y={y}
			fill="white"
			textAnchor={x > cx ? "start" : "end"}
			dominantBaseline="central"
			fontSize={12}
			fontWeight="bold"
		>
			{`${percentage.toFixed(0)}%`}
		</text>
	);
};

/**
 * RejectionReasonsChart Component
 * Displays rejection reasons as a pie chart
 */
export function RejectionReasonsChart({ dateRange, refreshKey, height = 350 }: RejectionReasonsChartProps) {
	// Fetch quotation stats data
	const {
		data: quotationData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["quotation-stats", dateRange.startDate, dateRange.endDate, refreshKey],
		queryFn: () => analyticsApi.getQuotationStats(dateRange.startDate, dateRange.endDate),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Transform data for chart
	const chartData = (() => {
		if (!quotationData?.rejectionReasons) return [];

		const reasons = Object.entries(quotationData.rejectionReasons);
		const total = reasons.reduce((sum, [, count]) => sum + count, 0);

		if (total === 0) return [];

		return reasons
			.map(([reason, count], index) => ({
				reason: formatReasonName(reason),
				count,
				percentage: (count / total) * 100,
				color: REJECTION_COLORS[index % REJECTION_COLORS.length],
			}))
			.sort((a, b) => b.count - a.count);
	})();

	// Format reason names for display
	function formatReasonName(reason: string): string {
		return reason
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	}

	// Loading state
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<PieChartIcon className="h-5 w-5" />
						Rejection Analysis
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Skeleton className="w-full h-[350px]" />
				</CardContent>
			</Card>
		);
	}

	// Error state
	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<PieChartIcon className="h-5 w-5" />
						Rejection Analysis
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>Failed to load rejection data: {error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
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
					<CardTitle className="flex items-center gap-2">
						<PieChartIcon className="h-5 w-5" />
						Rejection Analysis
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-[350px] text-muted-foreground">No rejection data available</div>
				</CardContent>
			</Card>
		);
	}

	// Calculate total rejections
	const totalRejections = chartData.reduce((sum, item) => sum + item.count, 0);
	const topReason = chartData[0];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<PieChartIcon className="h-5 w-5" />
					Rejection Analysis
				</CardTitle>
				<p className="text-sm text-muted-foreground">Why deals are lost • {totalRejections.toLocaleString()} total rejections</p>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer
					width="100%"
					height={height}
				>
					<PieChart>
						<Pie
							data={chartData}
							cx="50%"
							cy="50%"
							labelLine={false}
							label={renderCustomLabel}
							outerRadius={120}
							fill="#8884d8"
							dataKey="count"
						>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={entry.color}
								/>
							))}
						</Pie>
						<Tooltip content={<CustomTooltip />} />
						<Legend
							verticalAlign="bottom"
							height={36}
							formatter={(value) => {
								const reason = String(value);
								const matchingReason = chartData.find((entry) => entry.reason === reason);

								return (
									<span style={{ color: matchingReason?.color }}>
										{reason}
										{matchingReason ? ` (${matchingReason.percentage.toFixed(1)}%)` : ""}
									</span>
								);
							}}
						/>
					</PieChart>
				</ResponsiveContainer>

				{/* Key Insights */}
				<div className="mt-4 space-y-2">
					<div className="flex justify-between items-center text-sm">
						<span className="text-muted-foreground">Top Reason:</span>
						<span
							className="font-semibold"
							style={{ color: topReason.color }}
						>
							{topReason.reason} ({topReason.percentage.toFixed(1)}%)
						</span>
					</div>
					<div className="flex justify-between items-center text-sm">
						<span className="text-muted-foreground">Total Rejections:</span>
						<span className="font-semibold">{totalRejections.toLocaleString()}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default RejectionReasonsChart;
