"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function UsersPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Users</h1>
					<p className="text-muted-foreground">Manage users and employees</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					New User
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>User List</CardTitle>
					<CardDescription>All users in the system</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">User list will be displayed here...</p>
				</CardContent>
			</Card>
		</div>
	);
}
