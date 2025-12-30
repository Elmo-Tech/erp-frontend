"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/authStore";

const projects = [
	{ name: "E-commerce Platform", progress: 75, status: "In Progress" },
	{ name: "Inventory Management", progress: 90, status: "Review" },
];

export default function ClientDashboard() {
	const { user } = useAuthStore();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Welcome, {user?.name || "Client"} 👋</h1>
				<p className="text-muted-foreground">Here&apos;s an overview of your projects</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Active Projects</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">2</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">1</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Files for Approval</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">3</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Project Progress</CardTitle>
					<CardDescription>Current progress of your projects</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{projects.map((project) => (
						<div
							key={project.name}
							className="space-y-2"
						>
							<div className="flex items-center justify-between">
								<span className="font-medium">{project.name}</span>
								<span className="text-sm text-muted-foreground">{project.progress}%</span>
							</div>
							<Progress
								value={project.progress}
								className="h-2"
							/>
							<p className="text-xs text-muted-foreground">{project.status}</p>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
