/**
 * Audit Logs Page
 * Page for viewing and filtering system audit logs.
 *
 * Requirements: 17.1-17.5
 */

"use client";

import React from "react";
import { AuditLogViewer } from "@/_old/features/admin/components/AuditLogViewer";
import { usePermissions } from "@/_old/features/admin/hooks/usePermissions";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Audit Logs Page Component
 *
 * Integrates the AuditLogViewer component with permission checks.
 * Only accessible to users with view_audit_logs permission.
 */
export default function AuditLogsPage() {
	const { canViewAuditLogs } = usePermissions();

	// Permission check for view_audit_logs
	if (!canViewAuditLogs) {
		return (
			<div className="container mx-auto p-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>You don&apos;t have permission to access audit logs. This page requires the &apos;view_audit_logs&apos; permission.</AlertDescription>
				</Alert>
			</div>
		);
	}

	return <AuditLogViewer />;
}
