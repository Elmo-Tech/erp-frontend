"use client";

import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/shared/data-display/DataTable";
import { AuditLogEntry } from "../../types";
import { AlertTriangle, Database, Eye, Settings, Shield, User } from "lucide-react";

/**
 * Security-sensitive actions that should be highlighted
 */
const SECURITY_SENSITIVE_ACTIONS = ["update_internal_cost", "update_role_permissions", "create_role", "delete_role", "view_profitability", "login_failed", "password_changed", "permission_granted", "permission_revoked"];

/**
 * Get icon for audit log action type
 */
const getActionIcon = (action: string) => {
	if (action.includes("cost") || action.includes("profitability")) {
		return <Database className="h-4 w-4" />;
	}
	if (action.includes("role") || action.includes("permission")) {
		return <Shield className="h-4 w-4" />;
	}
	if (action.includes("login") || action.includes("password")) {
		return <User className="h-4 w-4" />;
	}
	if (action.includes("view") || action.includes("access")) {
		return <Eye className="h-4 w-4" />;
	}
	return <Settings className="h-4 w-4" />;
};

/**
 * Get badge variant for audit log action
 */
const getActionBadgeVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
	if (SECURITY_SENSITIVE_ACTIONS.includes(action)) {
		return "destructive";
	}
	if (action.includes("create") || action.includes("update")) {
		return "default";
	}
	if (action.includes("delete") || action.includes("failed")) {
		return "destructive";
	}
	if (action.includes("view") || action.includes("access")) {
		return "secondary";
	}
	return "outline";
};

/**
 * Format audit log action for display
 */
const formatAction = (action: string): string => {
	return action
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

/**
 * Format resource type and ID for display
 */
const formatResource = (auditableType: string, auditableId: number): string => {
	const type = auditableType.split("\\").pop() || auditableType;
	return `${type} #${auditableId}`;
};

/**
 * Check if action is security sensitive
 */
export const isSecuritySensitive = (action: string): boolean => {
	return SECURITY_SENSITIVE_ACTIONS.includes(action);
};

export function getAuditLogsColumns(): Column<AuditLogEntry>[] {
	return [
		{
			key: "icon",
			header: "",
			className: "w-[50px]",
			render: (log) => {
				const isSensitive = isSecuritySensitive(log.action);
				return (
					<div className={`flex items-center justify-center w-8 h-8 rounded-full ${isSensitive ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-muted text-muted-foreground"}`}>
						{isSensitive ? <AlertTriangle className="h-4 w-4" /> : getActionIcon(log.action)}
					</div>
				);
			},
		},
		{
			key: "timestamp",
			header: "Timestamp",
			render: (log) => (
				<div className="flex flex-col space-y-1">
					<div className="text-sm font-medium">{new Date(log.createdAt).toLocaleTimeString()}</div>
					<div className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleDateString()}</div>
				</div>
			),
		},
		{
			key: "user",
			header: "User",
			render: (log) => (
				<div className="flex items-center space-x-2">
					<User className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm font-medium">{log.userName}</span>
				</div>
			),
		},
		{
			key: "action",
			header: "Action",
			render: (log) => (
				<Badge
					variant={getActionBadgeVariant(log.action)}
					className="font-mono text-xs"
				>
					{formatAction(log.action)}
				</Badge>
			),
		},
		{
			key: "resource",
			header: "Resource",
			render: (log) => <div className="text-sm text-muted-foreground">{formatResource(log.auditableType, log.auditableId)}</div>,
		},
		{
			key: "ipAddress",
			header: "IP Address",
			render: (log) => <div className="text-xs text-muted-foreground font-mono">{log.ipAddress}</div>,
		},
		{
			key: "metadata",
			header: "Metadata",
			render: (log) =>
				log.metadata && Object.keys(log.metadata).length > 0 ? (
					<Badge
						variant="outline"
						className="text-xs"
					>
						{Object.keys(log.metadata).length} field{Object.keys(log.metadata).length !== 1 ? "s" : ""}
					</Badge>
				) : null,
		},
	];
}
