"use client";

import { UsersManagement } from "@/features/admin/components";

export default function UsersPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Users</h1>
				<p className="text-muted-foreground">Manage users, roles, and permissions</p>
			</div>

			<UsersManagement />
		</div>
	);
}
