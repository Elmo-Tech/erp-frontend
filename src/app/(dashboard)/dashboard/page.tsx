"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/shared/StatusBadge";
import { useAuthStore } from "@/store/authStore";
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats";
import { useMyAssignedTasks } from "@/features/dashboard/hooks/useTasks";
import { FolderKanban, Clock, Users, ArrowUpRight, ArrowDownRight, AlertCircle, ListTodo, PlayCircle, Timer, Coffee, ExternalLink, DollarSign } from "lucide-react";
import Link from "next/link";
import type { AdminDashboardOverview, ManagerDashboardOverview, DeveloperDashboardOverview } from "@/features/dashboard/types";
import { getRoleLabel } from "@/config/simplification";

export default function DashboardPage() {
	const { user } = useAuthStore();
	const { data, isLoading, isError } = useDashboardStats();

	const dashboardData = data?.data;

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

	const role = dashboardData?.role;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Welcome back, {user?.name || "User"} 👋</h1>
				<p className="text-muted-foreground">
					{role === "admin" && "Here's an overview of your business today"}
					{role === "manager" && "Here's how your team is performing"}
					{role === "developer" && "Here's your work summary"}
					{!role && "Here's your dashboard"}
				</p>
			</div>

			{role === "admin" && dashboardData && <AdminDashboard data={dashboardData as AdminDashboardOverview} />}
			{role === "manager" && dashboardData && <ManagerDashboard data={dashboardData as ManagerDashboardOverview} />}
			{role === "developer" && dashboardData && <EmployeeDashboard data={dashboardData as DeveloperDashboardOverview} />}
			{!role && dashboardData && <AdminDashboard data={dashboardData as AdminDashboardOverview} />}
		</div>
	);
}

function AdminDashboard({ data }: { data: AdminDashboardOverview }) {
	const stats = [
		{
			title: "Total Projects",
			value: data?.stats?.totalProjects ?? 0,
			change: data?.stats?.projectsChange ?? 0,
			icon: FolderKanban,
			color: "text-blue-600",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
			format: (v: number) => v.toString(),
		},
		{
			title: "Work Hours",
			value: data?.stats?.workHours ?? 0,
			change: data?.stats?.workHoursChange ?? 0,
			icon: Clock,
			color: "text-orange-600",
			bgColor: "bg-orange-100 dark:bg-orange-900/30",
			format: (v: number) => `${v.toLocaleString()}h`,
		},
		{
			title: "Active Clients",
			value: data?.stats?.activeClients ?? 0,
			change: data?.stats?.clientsChange ?? 0,
			icon: Users,
			color: "text-purple-600",
			bgColor: "bg-purple-100 dark:bg-purple-900/30",
			format: (v: number) => v.toString(),
			isAbsolute: true,
		},
		{
			title: "Monthly Sales",
			value: data?.stats?.monthlySales ?? 0,
			change: data?.stats?.salesChange ?? 0,
			icon: DollarSign,
			color: "text-emerald-600",
			bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
			format: (v: number) => `$${v.toLocaleString()}`,
		},
	];

	return (
		<>
			<StatsGrid stats={stats} />
			<div className="grid gap-4 md:grid-cols-2">
				<RecentProjectsCard projects={data?.recentProjects ?? []} />
				<RecentActivitiesCard activities={data?.recentActivities ?? []} />
			</div>
		</>
	);
}

function ManagerDashboard({ data }: { data: ManagerDashboardOverview }) {
	const stats = [
		{
			title: "Active Projects",
			value: data?.stats?.activeProjects ?? 0,
			icon: FolderKanban,
			color: "text-blue-600",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
			format: (v: number) => v.toString(),
		},
		{
			title: "Team Tasks",
			value: data?.stats?.totalTasks ?? 0,
			subtitle: `${data?.stats?.completedTasks ?? 0} completed`,
			icon: ListTodo,
			color: "text-green-600",
			bgColor: "bg-green-100 dark:bg-green-900/30",
			format: (v: number) => v.toString(),
		},
		{
			title: "Team Hours",
			value: data?.stats?.teamHours ?? 0,
			change: data?.stats?.teamHoursChange ?? 0,
			icon: Clock,
			color: "text-orange-600",
			bgColor: "bg-orange-100 dark:bg-orange-900/30",
			format: (v: number) => `${v}h`,
		},
		{
			title: "Team Members",
			value: data?.stats?.teamMembers ?? 0,
			icon: Users,
			color: "text-purple-600",
			bgColor: "bg-purple-100 dark:bg-purple-900/30",
			format: (v: number) => v.toString(),
		},
	];

	return (
		<>
			<StatsGrid stats={stats} />
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Team Tasks</CardTitle>
						<CardDescription>Recent tasks from your team</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{data?.recentTasks && data.recentTasks.length > 0 ? (
								data.recentTasks.map((task) => (
									<div
										key={task.taskId}
										className="flex items-center justify-between"
									>
										<div className="space-y-1">
											<p className="text-sm font-medium">{task.title}</p>
											<p className="text-xs text-muted-foreground">
												{task.assignee} • {task.project}
											</p>
										</div>
										<TaskStatusBadge
											status={task.status}
											size="sm"
										/>
									</div>
								))
							) : (
								<p className="text-sm text-muted-foreground text-center py-4">No tasks yet</p>
							)}
						</div>
					</CardContent>
				</Card>
				<RecentActivitiesCard activities={data?.recentActivities ?? []} />
			</div>
		</>
	);
}

function EmployeeDashboard({ data }: { data: DeveloperDashboardOverview }) {
	// Fetch assigned tasks for preview
	const { data: assignedTasksData } = useMyAssignedTasks({ perPage: 5 });
	const { user } = useAuthStore();

	const stats = [
		{
			title: "My Tasks",
			value: data?.stats?.myTotalTasks ?? 0,
			subtitle: `${data?.stats?.myCompletedTasks ?? 0} completed`,
			icon: ListTodo,
			color: "text-blue-600",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
			format: (v: number) => v.toString(),
		},
		{
			title: "In Progress",
			value: data?.stats?.myInProgressTasks ?? 0,
			icon: PlayCircle,
			color: "text-yellow-600",
			bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
			format: (v: number) => v.toString(),
		},
		{
			title: "My Hours",
			value: data?.stats?.myHoursThisMonth ?? 0,
			change: data?.stats?.myHoursChange ?? 0,
			icon: Clock,
			color: "text-green-600",
			bgColor: "bg-green-100 dark:bg-green-900/30",
			format: (v: number) => `${v}h`,
		},
		{
			title: "Today",
			value: data?.stats?.todayHours ?? 0,
			icon: data?.stats?.clockedIn ? Timer : Coffee,
			color: data?.stats?.clockedIn ? "text-green-600" : "text-gray-600",
			bgColor: data?.stats?.clockedIn ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-900/30",
			format: (v: number) => `${v}h`,
			subtitle: data?.stats?.clockedIn ? "Clocked in" : "Not clocked in",
		},
	];

	return (
		<>
			<StatsGrid stats={stats} />
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>My Tasks</CardTitle>
						<CardDescription>Your recent tasks</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{data?.recentTasks && data.recentTasks.length > 0 ? (
								data.recentTasks.map((task) => (
									<div
										key={task.taskId}
										className="flex items-center justify-between"
									>
										<div className="space-y-1">
											<p className="text-sm font-medium">{task.title}</p>
											<p className="text-xs text-muted-foreground">{task.project}</p>
										</div>
										<div className="flex items-center gap-2">
											{task.priority && (
												<TaskPriorityBadge
													priority={task.priority}
													size="sm"
												/>
											)}
											<TaskStatusBadge
												status={task.status}
												size="sm"
											/>
										</div>
									</div>
								))
							) : (
								<p className="text-sm text-muted-foreground text-center py-4">No tasks assigned</p>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle>My Assigned Tasks</CardTitle>
							<CardDescription>Tasks where you are a team member</CardDescription>
						</div>
						<Link href="/dashboard/my-tasks">
							<Button
								variant="outline"
								size="sm"
							>
								<ExternalLink className="h-4 w-4 mr-1" />
								View All
							</Button>
						</Link>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{assignedTasksData?.tasks && assignedTasksData.tasks.length > 0 ? (
								assignedTasksData.tasks.slice(0, 4).map((task) => {
									const myAssignment = task.assignees?.find((a) => a.userId === user?.userId);
									return (
										<div
											key={task.taskId}
											className="flex items-center justify-between"
										>
											<div className="space-y-1">
												<p className="text-sm font-medium">{task.title}</p>
												<p className="text-xs text-muted-foreground">
													{task.project?.title} • {myAssignment?.role ? getRoleLabel(myAssignment.role) : "Team Member"}
												</p>
											</div>
											<div className="flex items-center gap-2">
												<TaskStatusBadge
													status={task.status}
													size="sm"
												/>
											</div>
										</div>
									);
								})
							) : (
								<p className="text-sm text-muted-foreground text-center py-4">No assigned tasks</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
}

interface StatItem {
	title: string;
	value: number;
	change?: number;
	subtitle?: string;
	icon: React.ComponentType<{ className?: string }>;
	color: string;
	bgColor: string;
	format: (v: number) => string;
	isAbsolute?: boolean;
}

function StatsGrid({ stats }: { stats: StatItem[] }) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{stats.map((stat) => {
				const Icon = stat.icon;
				const hasChange = stat.change !== undefined;
				const trend = (stat.change ?? 0) >= 0 ? "up" : "down";
				const changeDisplay = stat.isAbsolute ? `${(stat.change ?? 0) >= 0 ? "+" : ""}${stat.change}` : `${(stat.change ?? 0) >= 0 ? "+" : ""}${Math.abs(stat.change ?? 0)}%`;

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
							{hasChange ? (
								<div className="flex items-center gap-1 text-xs">
									{trend === "up" ? <ArrowUpRight className="h-3 w-3 text-green-600" /> : <ArrowDownRight className="h-3 w-3 text-red-600" />}
									<span className={trend === "up" ? "text-green-600" : "text-red-600"}>{changeDisplay}</span>
									<span className="text-muted-foreground">from last month</span>
								</div>
							) : stat.subtitle ? (
								<p className="text-xs text-muted-foreground">{stat.subtitle}</p>
							) : null}
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

function RecentProjectsCard({ projects }: { projects: { projectId: number; name: string; status: string; progress: number }[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Projects</CardTitle>
				<CardDescription>Your latest projects in progress</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{projects.length > 0 ? (
						projects.map((project) => (
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
	);
}

function RecentActivitiesCard({ activities }: { activities: { activityId: number; action: string; user: string; time: string }[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Activity</CardTitle>
				<CardDescription>Latest activities</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{activities.length > 0 ? (
						activities.map((activity) => (
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
