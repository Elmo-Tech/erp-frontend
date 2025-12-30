"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TasksPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Tasks</h1>
				<p className="text-muted-foreground">Manage tasks and daily work</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Task List</CardTitle>
					<CardDescription>All tasks assigned to you</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Task tree will be displayed here...</p>
				</CardContent>
			</Card>
		</div>
	);
}
