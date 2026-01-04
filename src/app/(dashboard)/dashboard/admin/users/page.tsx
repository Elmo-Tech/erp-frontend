/**
 * Users Management Page
 * Page for managing system users, their roles, and permissions.
 */

"use client";

import { UsersManagement } from "@/features/admin/components/UsersManagement";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Users } from "lucide-react";

/**
 * Users Management Page Component
 *
 * Integrates the UsersManagement component with permission checks.
 * Only accessible to users with manage_users permission.
 */
export default function UsersManagementPage() {
	const { canManageUsers } = usePermissions();

	// Permission check for manage_users
	if (!canManageUsers) {
		return (
			<div className="container mx-auto p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Users Management</h1>
					<p className="text-muted-foreground">Manage system users and their access</p>
				</div>

				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>You don&apos;t have permission to manage users. This page requires the &apos;manage_users&apos; permission.</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold flex items-center gap-2">
					<Users className="h-8 w-8" />
					Users Management
				</h1>
				<p className="text-muted-foreground">Manage system users, their roles, and permissions</p>
			</div>

			{/* Users Management Component */}
			<UsersManagement />
		</div>
	);
}
