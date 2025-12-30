"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { TrendingUp, FolderKanban, Clock, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";

const stats = [
	{
		title: "Total Projects",
		value: "24",
		change: "+12%",
		trend: "up",
		icon: FolderKanban,
		color: "text-blue-600",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
	{
		title: "Monthly Sales",
		value: "$45,231",
		change: "+8.2%",
		trend: "up",
		icon: TrendingUp,
		color: "text-green-600",
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
	{
		title: "Work Hours",
		value: "1,284",
		change: "-3%",
		trend: "down",
		icon: Clock,
		color: "text-orange-600",
		bgColor: "bg-orange-100 dark:bg-orange-900/30",
	},
	{
		title: "Active Clients",
		value: "18",
		change: "+2",
		trend: "up",
		icon: Users,
		color: "text-purple-600",
		bgColor: "bg-purple-100 dark:bg-purple-900/30",
	},
];

const recentProjects = [
	{ name: "E-commerce Platform", status: "In Progress", progress: 75 },
	{ name: "Inventory Management", status: "Review", progress: 90 },
	{ name: "Client Portal", status: "In Progress", progress: 45 },
	{ name: "Mobile App", status: "Planning", progress: 15 },
];

export default function DashboardPage() {
	const { user } = useAuthStore();

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
					return (
						<Card key={stat.title}>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
								<div className={`rounded-lg p-2 ${stat.bgColor}`}>
									<Icon className={`h-4 w-4 ${stat.color}`} />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stat.value}</div>
								<div className="flex items-center gap-1 text-xs">
									{stat.trend === "up" ? <ArrowUpRight className="h-3 w-3 text-green-600" /> : <ArrowDownRight className="h-3 w-3 text-red-600" />}
									<span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>{stat.change}</span>
									<span className="text-muted-foreground">from last month</span>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Recent Projects */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Recent Projects</CardTitle>
						<CardDescription>Your latest projects in progress</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{recentProjects.map((project) => (
								<div
									key={project.name}
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
							))}
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
							{[
								{ action: "New task added", time: "5 minutes ago", user: "John Doe" },
								{ action: "Project status updated", time: "15 minutes ago", user: "Jane Smith" },
								{ action: "New file uploaded", time: "1 hour ago", user: "Mike Johnson" },
								{ action: "Quotation created", time: "2 hours ago", user: "Sarah Wilson" },
							].map((activity, index) => (
								<div
									key={index}
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
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
