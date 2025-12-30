"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SalesPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Sales</h1>
					<p className="text-muted-foreground">Manage leads and quotations</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					New Lead
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Leads</CardTitle>
						<CardDescription>Manage potential clients</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">12</p>
						<p className="text-sm text-muted-foreground">Active leads</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Quotations</CardTitle>
						<CardDescription>Sent proposals</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">8</p>
						<p className="text-sm text-muted-foreground">Pending quotations</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Conversion Rate</CardTitle>
						<CardDescription>Lead to contract ratio</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">67%</p>
						<p className="text-sm text-muted-foreground">This month</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
