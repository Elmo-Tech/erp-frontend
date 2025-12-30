"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ProjectsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Projects</h1>
					<p className="text-muted-foreground">Manage projects and contracts</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					New Project
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">In Progress</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">8</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Review</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">3</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Completed</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">15</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Overdue</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold text-destructive">2</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Project List</CardTitle>
					<CardDescription>All active projects</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Project list will be displayed here...</p>
				</CardContent>
			</Card>
		</div>
	);
}
