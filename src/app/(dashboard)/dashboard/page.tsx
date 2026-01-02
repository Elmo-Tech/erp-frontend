"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats";
import { TrendingUp, FolderKanban, Clock, Users, ArrowUpRight, ArrowDownRight, AlertCircle } from "lucide-react";

export default function DashboardPage() {
	const { user } = useAuthStore();
	const { data, isLoading, isError } = useDashboardStats();

	const dashboardData = data?.data;

	const stats = [
		{
			title: "Total Projects",
			value: dashboardData?.stats.totalProjects ?? 0,
			change: dashboardData?.stats.projectsChange ?? 0,
			trend: (dashboardData?.stats.projectsChange ?? 0) >= 0 ? "up" : "down",
			icon: FolderKanban,
			color: "text-blue-600",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
			format: (v: number) => v.toString(),
		},
		{
			title: "Monthly Sales",
			value: dashboardData?.stats.monthlySales ?? 0,
			change: dashboardData?.stats.salesChange ?? 0,
			trend: (dashboardData?.stats.salesChange ?? 0) >= 0 ? "up" : "down",
			icon: TrendingUp,
			color: "text-green-600",
			bgColor: "bg-green-100 dark:bg-green-900/30",
			format: (v: number) => `$${v.toLocaleString()}`,
		},
		{
			title: "Work Hours",
			value: dashboardData?.stats.workHours ?? 0,
			change: dashboardData?.stats.workHoursChange ?? 0,
			trend: (dashboardData?.stats.workHoursChange ?? 0) >= 0 ? "up" : "down",
			icon: Clock,
			color: "text-orange-600",
			bgColor: "bg-orange-100 dark:bg-orange-900/30",
			format: (v: number) => v.toLocaleString(),
		},
		{
			title: "Active Clients",
			value: dashboardData?.stats.activeClients ?? 0,
			change: dashboardData?.stats.clientsChange ?? 0,
			trend: (dashboardData?.stats.clientsChange ?? 0) >= 0 ? "up" : "down",
			icon: Users,
			color: "text-purple-600",
			bgColor: "bg-purple-100 dark:bg-purple-900/30",
			format: (v: number) => v.toString(),
		},
	];

	if (isLoading) {
		return <DashboardSkeleton />;
	}

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center h-64 space-y-4">
				<AlertCircle className="h-12 w-12 text-destructive" />
				<p className="text-muted-foreground">Failed to load dashboard data</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Welcome Section */}
			<div>
				<h1 className="text-2xl font-bold">Welcome back, {user?.name || "User"} 👋</h1>
				<p className="text-muted-foreground">Here&apos;s an overview of your business today</p>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => {
					const Icon = stat.icon;
					const changeValue = Math.abs(stat.change);
					const changeDisplay = stat.title === "Active Clients" ? `${stat.change >= 0 ? "+" : ""}${stat.change}` : `${stat.change >= 0 ? "+" : ""}${changeValue}%`;

					return (
						<Card key={stat.title}>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
								<div className={`rounded-lg p-2 ${stat.bgColor}`}>
									<Icon className={`h-4 w-4 ${stat.color}`} />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stat.format(stat.value)}</div>
								<div className="flex items-center gap-1 text-xs">
									{stat.trend === "up" ? <ArrowUpRight className="h-3 w-3 text-green-600" /> : <ArrowDownRight className="h-3 w-3 text-red-600" />}
									<span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>{changeDisplay}</span>
									<span className="text-muted-foreground">from last month</span>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Recent Projects & Activities */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Recent Projects</CardTitle>
						<CardDescription>Your latest projects in progress</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{dashboardData?.recentProjects && dashboardData.recentProjects.length > 0 ? (
								dashboardData.recentProjects.map((project) => (
									<div
										key={project.projectId}
										className="flex items-center justify-between"
									>
										<div className="space-y-1">
											<p className="text-sm font-medium">{project.name}</p>
											<p className="text-xs text-muted-foreground">{project.status}</p>
										</div>
										<div className="flex items-center gap-2">
											<div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
												<div
													className="h-full bg-primary transition-all"
													style={{ width: `${project.progress}%` }}
												/>
											</div>
											<span className="text-xs text-muted-foreground w-8">{project.progress}%</span>
										</div>
									</div>
								))
							) : (
								<p className="text-sm text-muted-foreground text-center py-4">No projects yet</p>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>Latest system activities</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
								dashboardData.recentActivities.map((activity) => (
									<div
										key={activity.activityId}
										className="flex items-start gap-3"
									>
										<div className="mt-1 h-2 w-2 rounded-full bg-primary" />
										<div className="flex-1 space-y-1">
											<p className="text-sm">{activity.action}</p>
											<p className="text-xs text-muted-foreground">
												{activity.user} • {activity.time}
											</p>
										</div>
									</div>
								))
							) : (
								<p className="text-sm text-muted-foreground text-center py-4">No recent activities</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			<div>
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-4 w-48 mt-2" />
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Card key={i}>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-8 w-8 rounded-lg" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-20" />
							<Skeleton className="h-3 w-32 mt-2" />
						</CardContent>
					</Card>
				))}
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				{[1, 2].map((i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-4 w-48" />
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{[1, 2, 3, 4].map((j) => (
									<Skeleton
										key={j}
										className="h-12 w-full"
									/>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
