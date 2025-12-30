"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function RolesPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Roles & Permissions</h1>
					<p className="text-muted-foreground">Manage system roles and permissions</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					New Role
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Permissions Matrix</CardTitle>
					<CardDescription>Define permissions for each role</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Permissions matrix will be displayed here...</p>
				</CardContent>
			</Card>
		</div>
	);
}
