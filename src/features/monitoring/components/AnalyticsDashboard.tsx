/**
 * AnalyticsDashboard Component
 * The CEO's landing page with visual intelligence for decision makers.
 * Includes Sales Funnel, Rejection Analysis, Cashflow Forecast, and Follow-up Radar.
 *
 * Requirements: FE-Pack 3 - Executive Dashboard
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/shared/forms/DatePicker";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart3, PieChart, TrendingUp, AlertCircle, RefreshCw, Calendar, DollarSign, Target, Users, Activity } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

import { SalesFunnelChart } from "./SalesFunnelChart";
import { RejectionReasonsChart } from "./RejectionReasonsChart";
import { CashflowChart } from "./CashflowChart";
import { UrgencyList } from "./UrgencyList";

interface AnalyticsDashboardProps {
	className?: string;
}

/**
 * Date range presets for quick selection
 */
const DATE_PRESETS = [
	{
		label: "Last 7 days",
		getValue: () => ({
			startDate: format(subDays(new Date(), 7), "yyyy-MM-dd"),
			endDate: format(new Date(), "yyyy-MM-dd"),
		}),
	},
	{
		label: "Last 30 days",
		getValue: () => ({
			startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
			endDate: format(new Date(), "yyyy-MM-dd"),
		}),
	},
	{
		label: "This month",
		getValue: () => ({
			startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
			endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
		}),
	},
];

/**
 * AnalyticsDashboard Component
 * The CEO's visual intelligence dashboard
 */
export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
	const [dateRange, setDateRange] = useState(() => DATE_PRESETS[1].getValue());
	const [refreshKey, setRefreshKey] = useState(0);

	const handleDatePreset = (preset: (typeof DATE_PRESETS)[0]) => {
		setDateRange(preset.getValue());
	};

	const handleRefresh = () => {
		setRefreshKey((prev) => prev + 1);
	};

	const handleDateRangeChange = (field: "startDate" | "endDate", value: string) => {
		setDateRange((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	return (
		<div className={`container mx-auto p-6 space-y-6 ${className || ""}`}>
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">Analytics Dashboard</h1>
					<p className="text-muted-foreground">Visual intelligence for executive decision making</p>
				</div>

				{/* Controls */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
					{/* Date Range Presets */}
					<div className="flex flex-wrap gap-2">
						{DATE_PRESETS.map((preset) => (
							<Button
								key={preset.label}
								variant="outline"
								size="sm"
								onClick={() => handleDatePreset(preset)}
								className="text-xs"
							>
								{preset.label}
							</Button>
						))}
					</div>

					{/* Custom Date Range */}
					<div className="flex items-center gap-2">
						<DatePicker
							value={dateRange.startDate}
							onChange={(value) => handleDateRangeChange("startDate", value)}
							placeholder="Start date"
							className="w-[140px]"
						/>
						<span className="text-muted-foreground text-sm">to</span>
						<DatePicker
							value={dateRange.endDate}
							onChange={(value) => handleDateRangeChange("endDate", value)}
							placeholder="End date"
							className="w-[140px]"
						/>
					</div>

					{/* Refresh Button */}
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
					>
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh
					</Button>
				</div>
			</div>

			{/* Key Metrics Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total Pipeline</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">Loading...</div>
						<p className="text-xs text-muted-foreground">Across all stages</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
						<Target className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">Loading...</div>
						<p className="text-xs text-muted-foreground">Lead to customer</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Active Leads</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">Loading...</div>
						<p className="text-xs text-muted-foreground">In pipeline</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Revenue Forecast</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">Loading...</div>
						<p className="text-xs text-muted-foreground">Next 30 days</p>
					</CardContent>
				</Card>
			</div>

			{/* Charts Grid */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Sales Funnel Chart */}
				<SalesFunnelChart
					dateRange={dateRange}
					refreshKey={refreshKey}
				/>

				{/* Rejection Reasons Chart */}
				<RejectionReasonsChart
					dateRange={dateRange}
					refreshKey={refreshKey}
				/>
			</div>

			{/* Cashflow Chart - Full Width */}
			<CashflowChart
				dateRange={dateRange}
				refreshKey={refreshKey}
			/>

			{/* Follow-up Radar */}
			<UrgencyList refreshKey={refreshKey} />
		</div>
	);
}

export default AnalyticsDashboard;
