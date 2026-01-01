/**
 * Admin Dashboard Page
 * Main admin dashboard showing key business metrics and analytics.
 *
 * Requirements: 14.1-14.6
 */

"use client";

import React from "react";
import { AdminDashboard } from "@/features/admin/components/AdminDashboard";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Admin Dashboard Page Component
 *
 * Integrates the AdminDashboard component with permission checks.
 * Only accessible to users with view_admin_stats permission.
 */
export default function AdminDashboardPage() {
	const { canViewAdminStats } = usePermissions();

	// Permission check for page access
	if (!canViewAdminStats) {
		return (
			<div className="container mx-auto p-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>You don&apos;t have permission to access the admin dashboard. This page requires the &apos;view_admin_stats&apos; permission.</AlertDescription>
				</Alert>
			</div>
		);
	}

	return <AdminDashboard />;
}
