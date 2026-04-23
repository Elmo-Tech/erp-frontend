/**
 * SalesFunnelChart Component
 * Bar chart showing the sales pipeline stages: Leads -> Qualified -> Won
 * Uses Recharts for visualization with responsive design.
 *
 * Requirements: FE-Pack 3 - Sales Funnel visualization
 */

"use client";

import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { AlertCircle, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/_old/features/sales/api/analytics";

interface SalesFunnelChartProps {
	dateRange: {
		startDate: string;
		endDate: string;
	};
	refreshKey: number;
	height?: number;
}

interface FunnelStageData {
	stage: string;
	count: number;
	value: number;
	color: string;
	conversionRate?: number;
}

interface TooltipPayloadEntry<T> {
	payload: T;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: TooltipPayloadEntry<FunnelStageData>[];
	label?: string;
}

/**
 * Custom tooltip component showing detailed information
 */
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload as FunnelStageData;
		return (
			<div className="bg-background border border-border rounded-lg p-3 shadow-lg">
				<p className="font-medium text-foreground mb-2">{label}</p>
				<div className="space-y-1 text-sm">
					<p className="text-blue-600">Count: {data.count.toLocaleString()}</p>
					<p className="text-green-600">Value: ${data.value.toLocaleString()}</p>
					{data.conversionRate && <p className="text-orange-600">Conversion: {data.conversionRate.toFixed(1)}%</p>}
				</div>
			</div>
		);
	}
	return null;
};

/**
 * SalesFunnelChart Component
 * Displays the sales pipeline as a bar chart
 */
export function SalesFunnelChart({ dateRange, refreshKey, height = 350 }: SalesFunnelChartProps) {
	// Fetch pipeline data
	const {
		data: pipelineData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["sales-pipeline", refreshKey],
		queryFn: () => analyticsApi.getPipeline(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Transform data for chart
	const chartData = useMemo(() => {
		if (!pipelineData?.stages) return [];

		// Define stage colors and order
		const stageConfig = {
			new: { color: "#94a3b8", order: 1, label: "New Leads" },
			contacted: { color: "#60a5fa", order: 2, label: "Contacted" },
			qualified: { color: "#34d399", order: 3, label: "Qualified" },
			proposal_sent: { color: "#fbbf24", order: 4, label: "Proposal Sent" },
			negotiation: { color: "#f97316", order: 5, label: "Negotiation" },
			won: { color: "#10b981", order: 6, label: "Won" },
			lost: { color: "#ef4444", order: 7, label: "Lost" },
		};

		const stages = pipelineData.stages
			.map((stage) => {
				const config = stageConfig[stage.status as keyof typeof stageConfig];
				return {
					stage: config?.label || stage.label || stage.status,
					count: stage.count || 0,
					value: stage.value || 0,
					color: config?.color || "#6b7280",
					order: config?.order || 999,
				};
			})
			.sort((a, b) => a.order - b.order)
			.filter((stage) => stage.count > 0); // Only show stages with data

		// Calculate conversion rates
		return stages.map((stage, index) => {
			const previousStage = stages[index - 1];
			const conversionRate = previousStage ? (stage.count / previousStage.count) * 100 : undefined;

			return {
				...stage,
				conversionRate,
			};
		});
	}, [pipelineData]);

	// Loading state
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5" />
						Sales Funnel
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
						<BarChart3 className="h-5 w-5" />
						Sales Funnel
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>Failed to load sales funnel data: {error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
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
						<BarChart3 className="h-5 w-5" />
						Sales Funnel
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-[350px] text-muted-foreground">No sales funnel data available</div>
				</CardContent>
			</Card>
		);
	}

	// Calculate total leads and conversion rate
	const totalLeads = chartData[0]?.count || 0;
	const wonDeals = chartData.find((stage) => stage.stage.toLowerCase().includes("won"))?.count || 0;
	const overallConversionRate = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BarChart3 className="h-5 w-5" />
					Sales Funnel
				</CardTitle>
				<p className="text-sm text-muted-foreground">Pipeline progression • {overallConversionRate.toFixed(1)}% overall conversion rate</p>
			</CardHeader>
			<CardContent>
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
							bottom: 5,
						}}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							className="opacity-30"
						/>
						<XAxis
							dataKey="stage"
							fontSize={12}
							className="text-muted-foreground"
							angle={-45}
							textAnchor="end"
							height={80}
						/>
						<YAxis
							fontSize={12}
							className="text-muted-foreground"
						/>
						<Tooltip content={<CustomTooltip />} />

						<Bar
							dataKey="count"
							radius={[4, 4, 0, 0]}
						>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={entry.color}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>

				{/* Conversion Rate Summary */}
				<div className="mt-4 grid grid-cols-2 gap-4 text-sm">
					<div>
						<p className="text-muted-foreground">Total Leads</p>
						<p className="font-semibold">{totalLeads.toLocaleString()}</p>
					</div>
					<div>
						<p className="text-muted-foreground">Won Deals</p>
						<p className="font-semibold text-green-600">{wonDeals.toLocaleString()}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default SalesFunnelChart;
