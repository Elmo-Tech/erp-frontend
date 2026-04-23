"use client";

import { UsersWrapper } from "@/_old/features/admin/components";
import { usePermissions } from "@/_old/features/admin/hooks/usePermissions";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { AlertCircle, Users } from "lucide-react";

export default function UsersManagementPage() {
	const { canManageUsers } = usePermissions();

	if (!canManageUsers) {
		return (
			<div className="container mx-auto p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Users Management</h1>
					<p className="text-muted-foreground">Manage system users and their access</p>
				</div>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>You don&apos;t have permission to manage users.</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold flex items-center gap-2">
					<Users className="h-8 w-8" />
					Users Management
				</h1>
				<p className="text-muted-foreground">Manage system users, their roles, and permissions</p>
			</div>
			<UsersWrapper />
		</div>
	);
}
