"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WikiPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Wiki</h1>
				<p className="text-muted-foreground">Documentation and technical information</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Knowledge Base</CardTitle>
					<CardDescription>Technical documentation for projects</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Wiki content will be displayed here...</p>
				</CardContent>
			</Card>
		</div>
	);
}
