"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientProjectsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">My Projects</h1>
				<p className="text-muted-foreground">View your project details</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Project List</CardTitle>
					<CardDescription>All projects associated with your account</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Project list will be displayed here...</p>
				</CardContent>
			</Card>
		</div>
	);
}
