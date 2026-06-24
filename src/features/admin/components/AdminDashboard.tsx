"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, AlertCircle, CheckCircle, Clock, FolderKanban } from "lucide-react";
import { useAdminOverview } from "../hooks/useAdminStats";
import { useAdminPermissions } from "../hooks";

interface MetricCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon }) => (
	<Card>
		<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
			<div className="text-muted-foreground">{icon}</div>
		</CardHeader>
		<CardContent>
			<div className="text-2xl font-bold">{value}</div>
			{subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
		</CardContent>
	</Card>
);

const DashboardSkeleton: React.FC = () => (
	<div className="space-y-6">
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<Card key={i}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-4" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-8 w-20 mb-2" />
						<Skeleton className="h-3 w-16" />
					</CardContent>
				</Card>
			))}
		</div>
		<div className="grid gap-4 md:grid-cols-2">
			<Skeleton className="h-[220px]" />
			<Skeleton className="h-[220px]" />
		</div>
	</div>
);

export const AdminDashboard: React.FC = () => {
	const { data, isLoading, error } = useAdminOverview();
	const { canViewAdminStats } = useAdminPermissions();

	if (!canViewAdminStats) {
		return (
			<div className="container mx-auto p-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>You don&apos;t have permission to view admin statistics.</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="container mx-auto p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Reports</h1>
					<p className="text-muted-foreground">Operational project and attendance overview</p>
				</div>
				<DashboardSkeleton />
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Reports</h1>
					<p className="text-muted-foreground">Operational project and attendance overview</p>
				</div>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>Failed to load dashboard data: {error.message}</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="container mx-auto p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Reports</h1>
					<p className="text-muted-foreground">Operational project and attendance overview</p>
				</div>
				<div className="flex items-center justify-center h-[300px] text-muted-foreground">No dashboard data available</div>
			</div>
		);
	}

	const activeProjects = data.activeProjects || 0;
	const completedProjects = data.completedProjects || 0;
	const totalProjects = activeProjects + completedProjects;
	const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
	const teamUtilization = Math.max(0, Math.min(100, data.teamUtilization || 0));

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Reports</h1>
				<p className="text-muted-foreground">Operational project and attendance overview</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					title="Active Projects"
					value={activeProjects}
					subtitle="Currently in progress"
					icon={<Activity className="h-4 w-4" />}
				/>
				<MetricCard
					title="Completed Projects"
					value={completedProjects}
					subtitle={`${completionRate}% completion rate`}
					icon={<CheckCircle className="h-4 w-4" />}
				/>
				<MetricCard
					title="Total Projects"
					value={totalProjects}
					subtitle="Active and completed"
					icon={<FolderKanban className="h-4 w-4" />}
				/>
				<MetricCard
					title="Team Utilization"
					value={`${teamUtilization.toFixed(1)}%`}
					subtitle="Based on attendance activity"
					icon={<Clock className="h-4 w-4" />}
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
							<FolderKanban className="h-4 w-4" />
							Project Status
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>Completed</span>
									<span className="font-medium">{completionRate}%</span>
								</div>
								<Progress
									value={completionRate}
									className="h-2"
								/>
							</div>
							<div className="grid grid-cols-2 gap-3 text-sm">
								<div className="rounded-lg border bg-muted/30 p-3">
									<p className="text-xs text-muted-foreground">Active</p>
									<p className="mt-1 text-xl font-semibold">{activeProjects}</p>
								</div>
								<div className="rounded-lg border bg-muted/30 p-3">
									<p className="text-xs text-muted-foreground">Completed</p>
									<p className="mt-1 text-xl font-semibold">{completedProjects}</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
							<Clock className="h-4 w-4" />
							Attendance Summary
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>Utilization</span>
									<span className="font-medium">{teamUtilization.toFixed(1)}%</span>
								</div>
								<Progress
									value={teamUtilization}
									className="h-2"
								/>
							</div>
							<p className="text-sm text-muted-foreground">This operational summary uses attendance activity from the current backend response.</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default AdminDashboard;
