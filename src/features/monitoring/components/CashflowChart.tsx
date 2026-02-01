/**
 * CashflowChart Component
 * Area chart comparing "Invoiced" vs "Projected Revenue" over time
 * Uses Recharts for visualization with responsive design.
 *
 * Requirements: FE-Pack 3 - Cashflow Forecast visualization
 */

"use client";

import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/features/sales/api/analytics";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface CashflowChartProps {
	dateRange: {
		startDate: string;
		endDate: string;
	};
	refreshKey: number;
	height?: number;
}

interface CashflowDataPoint {
	date: string;
	invoiced: number;
	projected: number;
	difference: number;
}

/**
 * Custom tooltip component showing detailed information
 */
const CustomTooltip = ({ active, payload, label }: any) => {
	if (active && payload && payload.length) {
		const invoiced = payload.find((p: any) => p.dataKey === "invoiced")?.value || 0;
		const projected = payload.find((p: any) => p.dataKey === "projected")?.value || 0;
		const difference = projected - invoiced;

		return (
			<div className="bg-background border border-border rounded-lg p-3 shadow-lg">
				<p className="font-medium text-foreground mb-2">{label}</p>
				<div className="space-y-1 text-sm">
					<p className="text-blue-600">Invoiced: ${invoiced.toLocaleString()}</p>
					<p className="text-green-600">Projected: ${projected.toLocaleString()}</p>
					<p className={difference >= 0 ? "text-green-600" : "text-red-600"}>
						Difference: ${Math.abs(difference).toLocaleString()} {difference >= 0 ? "ahead" : "behind"}
					</p>
				</div>
			</div>
		);
	}
	return null;
};

/**
 * CashflowChart Component
 * Displays cashflow forecast as an area chart
 */
export function CashflowChart({ dateRange, refreshKey, height = 400 }: CashflowChartProps) {
	// Fetch revenue forecast data
	const {
		data: forecastData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["revenue-forecast", refreshKey],
		queryFn: () => analyticsApi.getRevenueForecast(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Transform data for chart
	const chartData = useMemo(() => {
		if (!forecastData) return [];

		// Generate date range for the next 30 days
		const startDate = new Date();
		const endDate = addDays(startDate, 30);
		const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

		// Create base data structure
		const baseData = dateRange.map((date) => ({
			date: format(date, "MMM dd"),
			invoiced: 0,
			projected: 0,
			difference: 0,
		}));

		// Add milestone data
		if (forecastData.milestonesDue) {
			forecastData.milestonesDue.forEach((milestone) => {
				const milestoneDate = new Date(milestone.dueDate);
				const dayIndex = Math.floor((milestoneDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

				if (dayIndex >= 0 && dayIndex < baseData.length) {
					// Add to projected revenue
					baseData[dayIndex].projected += milestone.amount;

					// If milestone is completed, add to invoiced
					if (milestone.status === "completed" || milestone.status === "paid") {
						baseData[dayIndex].invoiced += milestone.amount;
					}
				}
			});
		}

		// Calculate cumulative values and differences
		let cumulativeInvoiced = 0;
		let cumulativeProjected = 0;

		return baseData.map((day) => {
			cumulativeInvoiced += day.invoiced;
			cumulativeProjected += day.projected;

			return {
				...day,
				invoiced: cumulativeInvoiced,
				projected: cumulativeProjected,
				difference: cumulativeProjected - cumulativeInvoiced,
			};
		});
	}, [forecastData]);

	// Loading state
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Cashflow Forecast
					</CardTitle>
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
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Cashflow Forecast
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>Failed to load cashflow data: {error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
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
						<TrendingUp className="h-5 w-5" />
						Cashflow Forecast
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-[400px] text-muted-foreground">No cashflow data available</div>
				</CardContent>
			</Card>
		);
	}

	// Calculate key metrics
	const finalData = chartData[chartData.length - 1];
	const totalInvoiced = finalData?.invoiced || 0;
	const totalProjected = finalData?.projected || 0;
	const projectedGrowth = totalInvoiced > 0 ? ((totalProjected - totalInvoiced) / totalInvoiced) * 100 : 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingUp className="h-5 w-5" />
					Cashflow Forecast
				</CardTitle>
				<p className="text-sm text-muted-foreground">
					30-day revenue projection • {projectedGrowth > 0 ? "+" : ""}
					{projectedGrowth.toFixed(1)}% projected growth
				</p>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer
					width="100%"
					height={height}
				>
					<AreaChart
						data={chartData}
						margin={{
							top: 20,
							right: 30,
							left: 20,
							bottom: 5,
						}}
					>
						<defs>
							<linearGradient
								id="invoicedGradient"
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="5%"
									stopColor="#3b82f6"
									stopOpacity={0.3}
								/>
								<stop
									offset="95%"
									stopColor="#3b82f6"
									stopOpacity={0.1}
								/>
							</linearGradient>
							<linearGradient
								id="projectedGradient"
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="5%"
									stopColor="#10b981"
									stopOpacity={0.3}
								/>
								<stop
									offset="95%"
									stopColor="#10b981"
									stopOpacity={0.1}
								/>
							</linearGradient>
						</defs>

						<CartesianGrid
							strokeDasharray="3 3"
							className="opacity-30"
						/>
						<XAxis
							dataKey="date"
							fontSize={12}
							className="text-muted-foreground"
							interval="preserveStartEnd"
						/>
						<YAxis
							fontSize={12}
							className="text-muted-foreground"
							tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Legend />

						<Area
							type="monotone"
							dataKey="invoiced"
							stackId="1"
							stroke="#3b82f6"
							fill="url(#invoicedGradient)"
							name="Invoiced Revenue"
							strokeWidth={2}
						/>
						<Area
							type="monotone"
							dataKey="projected"
							stackId="2"
							stroke="#10b981"
							fill="url(#projectedGradient)"
							name="Projected Revenue"
							strokeWidth={2}
							strokeDasharray="5 5"
						/>
					</AreaChart>
				</ResponsiveContainer>

				{/* Key Metrics Summary */}
				<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
					<div className="text-center">
						<p className="text-muted-foreground">Current Invoiced</p>
						<p className="font-semibold text-blue-600">${totalInvoiced.toLocaleString()}</p>
					</div>
					<div className="text-center">
						<p className="text-muted-foreground">30-Day Projection</p>
						<p className="font-semibold text-green-600">${totalProjected.toLocaleString()}</p>
					</div>
					<div className="text-center">
						<p className="text-muted-foreground">Potential Growth</p>
						<p className={`font-semibold ${projectedGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
							{projectedGrowth > 0 ? "+" : ""}
							{projectedGrowth.toFixed(1)}%
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default CashflowChart;
