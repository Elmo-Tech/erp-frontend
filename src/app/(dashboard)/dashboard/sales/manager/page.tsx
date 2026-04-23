"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { PipelineOverview, AlertsPanel, TeamPerformanceTable, BottleneckAnalysis } from "@/_old/features/sales/components/dashboard";
import { LayoutDashboard, AlertTriangle, Users, BarChart3 } from "lucide-react";

export default function SalesManagerDashboardPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Sales Manager Dashboard</h1>
				<p className="text-muted-foreground">Monitor pipeline health, team performance, and alerts</p>
			</div>

			<Tabs
				defaultValue="overview"
				className="space-y-4"
			>
				<TabsList>
					<TabsTrigger
						value="overview"
						className="gap-2"
					>
						<LayoutDashboard className="h-4 w-4" />
						Overview
					</TabsTrigger>
					<TabsTrigger
						value="alerts"
						className="gap-2"
					>
						<AlertTriangle className="h-4 w-4" />
						Alerts
					</TabsTrigger>
					<TabsTrigger
						value="team"
						className="gap-2"
					>
						<Users className="h-4 w-4" />
						Team
					</TabsTrigger>
					<TabsTrigger
						value="analysis"
						className="gap-2"
					>
						<BarChart3 className="h-4 w-4" />
						Analysis
					</TabsTrigger>
				</TabsList>

				<TabsContent
					value="overview"
					className="space-y-6"
				>
					<PipelineOverview />
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<AlertsPanel />
						<TeamPerformanceTable />
					</div>
				</TabsContent>

				<TabsContent value="alerts">
					<AlertsPanel />
				</TabsContent>

				<TabsContent value="team">
					<TeamPerformanceTable />
				</TabsContent>

				<TabsContent value="analysis">
					<BottleneckAnalysis />
				</TabsContent>
			</Tabs>
		</div>
	);
}
