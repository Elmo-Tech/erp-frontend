/**
 * Quality Dashboard Page
 * Page for viewing quality metrics including bounce rates and task analysis.
 *
 * Requirements: 15.1-15.6
 */

"use client";

import React from "react";
import { QualityDashboard } from "@/features/admin/components/QualityDashboard";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Quality Dashboard Page Component
 *
 * Integrates the QualityDashboard component with permission checks.
 * Accessible to users with view_admin_stats permission.
 */
export default function QualityDashboardPage() {
	const { canViewAdminStats } = usePermissions();

	// Permission check - quality metrics are part of admin stats
	if (!canViewAdminStats) {
		return (
			<div className="container mx-auto p-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>You don&apos;t have permission to access the quality dashboard. This page requires the &apos;view_admin_stats&apos; permission.</AlertDescription>
				</Alert>
			</div>
		);
	}

	return <QualityDashboard />;
}
