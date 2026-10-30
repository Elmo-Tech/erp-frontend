/**
 * Roles Management Page
 * Page for managing role permissions via the RolesMatrix component.
 *
 * Requirements: 11.1-11.6, 18.3
 */

"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { RolesMatrix } from "@/features/admin/components/RolesMatrix";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Shield, Info } from "lucide-react";

/**
 * Roles Management Page Component
 *
 * Integrates the RolesMatrix component with permission checks.
 * Only accessible to users with manage_roles permission.
 */
export default function RolesManagementPage() {
	const { canManageRoles } = usePermissions();

	// Permission check for manage_roles
	if (!canManageRoles) {
		return (
			<div className="space-y-6">
				<PageHeader title="Roles Management" description="Manage role permissions and access control." icon={Shield} />

				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>You don&apos;t have permission to manage roles. This page requires the &apos;manage_roles&apos; permission.</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader title="Roles Management" description="Manage role permissions and access control for the system." icon={Shield} />

			{/* Information Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Info className="h-5 w-5" />
						How to Use
					</CardTitle>
					<CardDescription>Use the matrix below to manage permissions for each role</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2 text-sm text-muted-foreground">
						<p>• Click checkboxes to grant or revoke permissions for each role</p>
						<p>• Protected roles (like admin and client) cannot be modified</p>
						<p>• Changes are saved automatically when you toggle permissions</p>
						<p>• Security-sensitive permissions are highlighted for your attention</p>
					</div>
				</CardContent>
			</Card>

			{/* Roles Matrix Component */}
			<RolesMatrix />
		</div>
	);
}
