/**
 * AuditLogViewer Component
 * Component for viewing and filtering audit logs with security-sensitive action highlighting.
 *
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5
 */

"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Filter, Calendar, User, Shield, AlertTriangle, Clock, Database, Settings, Eye, RefreshCw, AlertCircle } from "lucide-react";
import { useAuditLogs, useAuditLogActionTypes } from "../hooks/useAuditLogs";
import { useAdminPermissions } from "../hooks";
import { AuditLogFilters, AuditLogEntry } from "../types";

/**
 * Security-sensitive actions that should be highlighted
 * Requirement 17.5: Highlight security-sensitive actions
 */
const SECURITY_SENSITIVE_ACTIONS = ["update_internal_cost", "update_role_permissions", "create_role", "delete_role", "view_profitability", "login_failed", "password_changed", "permission_granted", "permission_revoked"];

/**
 * Get icon for audit log action type
 */
const getActionIcon = (action: string): React.ReactNode => {
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
 * Loading skeleton for audit log table
 */
const AuditLogTableSkeleton: React.FC = () => (
	<div className="space-y-4">
		{Array.from({ length: 10 }).map((_, i) => (
			<div
				key={i}
				className="flex items-center space-x-4 p-4 border rounded-lg"
			>
				<Skeleton className="h-4 w-4" />
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-4 w-28" />
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-20" />
			</div>
		))}
	</div>
);

/**
 * Individual audit log row component
 */
interface AuditLogRowProps {
	log: AuditLogEntry;
}

const AuditLogRow: React.FC<AuditLogRowProps> = ({ log }) => {
	const isSensitive = SECURITY_SENSITIVE_ACTIONS.includes(log.action);

	return (
		<TableRow className={isSensitive ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800" : ""}>
			<TableCell className="w-[50px]">
				<div className={`flex items-center justify-center w-8 h-8 rounded-full ${isSensitive ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-muted text-muted-foreground"}`}>
					{isSensitive ? <AlertTriangle className="h-4 w-4" /> : getActionIcon(log.action)}
				</div>
			</TableCell>

			<TableCell>
				<div className="flex flex-col space-y-1">
					<div className="text-sm font-medium">{new Date(log.createdAt).toLocaleString()}</div>
					<div className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleDateString()}</div>
				</div>
			</TableCell>

			<TableCell>
				<div className="flex items-center space-x-2">
					<User className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm font-medium">{log.userName}</span>
				</div>
			</TableCell>

			<TableCell>
				<Badge
					variant={getActionBadgeVariant(log.action)}
					className="font-mono text-xs"
				>
					{formatAction(log.action)}
				</Badge>
			</TableCell>

			<TableCell>
				<div className="text-sm text-muted-foreground">{formatResource(log.auditableType, log.auditableId)}</div>
			</TableCell>

			<TableCell>
				<div className="text-xs text-muted-foreground font-mono">{log.ipAddress}</div>
			</TableCell>

			<TableCell>
				{log.metadata && Object.keys(log.metadata).length > 0 && (
					<Badge
						variant="outline"
						className="text-xs"
					>
						{Object.keys(log.metadata).length} field{Object.keys(log.metadata).length !== 1 ? "s" : ""}
					</Badge>
				)}
			</TableCell>
		</TableRow>
	);
};

/**
 * Filters component for audit logs
 */
interface AuditLogFiltersProps {
	filters: AuditLogFilters;
	onFiltersChange: (filters: AuditLogFilters) => void;
	actionTypes: string[];
	isLoading?: boolean;
}

const AuditLogFiltersComponent: React.FC<AuditLogFiltersProps> = ({ filters, onFiltersChange, actionTypes, isLoading = false }) => {
	const handleFilterChange = useCallback(
		(key: keyof AuditLogFilters, value: string | number | undefined) => {
			onFiltersChange({
				...filters,
				[key]: value || undefined,
				page: 1, // Reset to first page when filters change
			});
		},
		[filters, onFiltersChange]
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Filter className="h-5 w-5" />
					Filters & Search
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{/* Search by Resource ID */}
					<div className="space-y-2">
						<label className="text-sm font-medium">Resource ID</label>
						<div className="relative">
							<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								type="number"
								placeholder="Search by ID..."
								value={filters.resourceId || ""}
								onChange={(e) => handleFilterChange("resourceId", e.target.value ? parseInt(e.target.value) : undefined)}
								className="pl-8"
								disabled={isLoading}
							/>
						</div>
					</div>

					{/* Action Type Filter */}
					<div className="space-y-2">
						<label className="text-sm font-medium">Action Type</label>
						<Select
							value={filters.action || "all"}
							onValueChange={(value) => handleFilterChange("action", value === "all" ? undefined : value)}
							disabled={isLoading}
						>
							<SelectTrigger>
								<SelectValue placeholder="All actions" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All actions</SelectItem>
								{actionTypes.map((action) => (
									<SelectItem
										key={action}
										value={action}
									>
										{formatAction(action)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Date From */}
					<div className="space-y-2">
						<label className="text-sm font-medium">From Date</label>
						<div className="relative">
							<Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								type="date"
								value={filters.dateFrom || ""}
								onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
								className="pl-8"
								disabled={isLoading}
							/>
						</div>
					</div>

					{/* Date To */}
					<div className="space-y-2">
						<label className="text-sm font-medium">To Date</label>
						<div className="relative">
							<Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								type="date"
								value={filters.dateTo || ""}
								onChange={(e) => handleFilterChange("dateTo", e.target.value)}
								className="pl-8"
								disabled={isLoading}
							/>
						</div>
					</div>
				</div>

				{/* Clear Filters */}
				<div className="flex justify-between items-center pt-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onFiltersChange({ page: 1, perPage: filters.perPage })}
						disabled={isLoading}
					>
						Clear Filters
					</Button>

					<div className="text-xs text-muted-foreground">
						{Object.keys(filters).filter((key) => key !== "page" && key !== "perPage" && filters[key as keyof AuditLogFilters]).length} active filter
						{Object.keys(filters).filter((key) => key !== "page" && key !== "perPage" && filters[key as keyof AuditLogFilters]).length !== 1 ? "s" : ""}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

/**
 * AuditLogViewer Component
 * Requirement 17.1: Display timestamp, user, action, resource info, IP
 * Requirement 17.2: Support filtering by action, user, date range
 * Requirement 17.3: Support search by resource ID
 * Requirement 17.4: Paginate results
 * Requirement 17.5: Highlight security-sensitive actions
 */
export const AuditLogViewer: React.FC = () => {
	const { canViewAuditLogs } = useAdminPermissions();

	// State for filters
	const [filters, setFilters] = useState<AuditLogFilters>({
		page: 1,
		perPage: 20,
	});

	// API calls
	const { data, isLoading, error, refetch } = useAuditLogs(filters, canViewAuditLogs);
	const { data: actionTypes = [], isLoading: actionTypesLoading } = useAuditLogActionTypes(canViewAuditLogs);

	// Permission check
	if (!canViewAuditLogs) {
		return (
			<div className="container mx-auto p-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>You don&apos;t have permission to view audit logs. This feature requires the &apos;view_audit_logs&apos; permission.</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Loading state
	if (isLoading && !data) {
		return (
			<div className="container mx-auto p-6 space-y-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Audit Log Viewer</h1>
					<p className="text-muted-foreground">View and filter system audit logs for security monitoring</p>
				</div>
				<Skeleton className="h-[200px]" />
				<AuditLogTableSkeleton />
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="container mx-auto p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Audit Log Viewer</h1>
					<p className="text-muted-foreground">View and filter system audit logs for security monitoring</p>
				</div>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>Failed to load audit logs: {error.message}</AlertDescription>
				</Alert>
				<Button
					onClick={() => refetch()}
					className="mt-4"
				>
					<RefreshCw className="h-4 w-4 mr-2" />
					Retry
				</Button>
			</div>
		);
	}

	if (!data?.auditLogs || data.auditLogs.length === 0) {
		return (
			<div className="container mx-auto p-6 space-y-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Audit Log Viewer</h1>
					<p className="text-muted-foreground">View and filter system audit logs for security monitoring</p>
				</div>

				<AuditLogFiltersComponent
					filters={filters}
					onFiltersChange={setFilters}
					actionTypes={actionTypes}
					isLoading={isLoading || actionTypesLoading}
				/>

				<div className="flex items-center justify-center h-[400px] text-muted-foreground">
					<div className="text-center">
						<Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>No audit logs found</p>
						<p className="text-sm">Try adjusting your filters or check back later</p>
					</div>
				</div>
			</div>
		);
	}

	// Calculate pagination
	const { pagination } = data;
	const totalPages = pagination.totalPages;
	const currentPage = pagination.currentPage;

	// Statistics
	const sensitiveActionsCount = data.auditLogs.filter((log) => SECURITY_SENSITIVE_ACTIONS.includes(log.action)).length;
	const uniqueUsers = new Set(data.auditLogs.map((log) => log.userName)).size;
	const uniqueActions = new Set(data.auditLogs.map((log) => log.action)).size;

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Audit Log Viewer</h1>
				<p className="text-muted-foreground">View and filter system audit logs for security monitoring</p>
			</div>

			{/* Statistics Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total Logs</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{pagination.total.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							Showing {data.auditLogs.length} of {pagination.total}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Security Alerts</CardTitle>
						<AlertTriangle className="h-4 w-4 text-red-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">{sensitiveActionsCount}</div>
						<p className="text-xs text-muted-foreground">Sensitive actions in current view</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
						<User className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{uniqueUsers}</div>
						<p className="text-xs text-muted-foreground">Unique users in current view</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Action Types</CardTitle>
						<Settings className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{uniqueActions}</div>
						<p className="text-xs text-muted-foreground">Different actions in current view</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<AuditLogFiltersComponent
				filters={filters}
				onFiltersChange={setFilters}
				actionTypes={actionTypes}
				isLoading={isLoading || actionTypesLoading}
			/>

			{/* Audit Log Table */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							Audit Logs
						</CardTitle>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => refetch()}
								disabled={isLoading}
							>
								<RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
								Refresh
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[50px]"></TableHead>
									<TableHead>Timestamp</TableHead>
									<TableHead>User</TableHead>
									<TableHead>Action</TableHead>
									<TableHead>Resource</TableHead>
									<TableHead>IP Address</TableHead>
									<TableHead>Metadata</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.auditLogs.map((log) => (
									<AuditLogRow
										key={log.id}
										log={log}
									/>
								))}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between mt-4">
							<div className="text-sm text-muted-foreground">
								Page {currentPage} of {totalPages} ({pagination.total} total logs)
							</div>
							<Pagination>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											href="#"
											onClick={(e) => {
												e.preventDefault();
												if (currentPage > 1) {
													setFilters((prev) => ({ ...prev, page: currentPage - 1 }));
												}
											}}
											className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
										/>
									</PaginationItem>

									{/* Page numbers */}
									{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
										let pageNum;
										if (totalPages <= 5) {
											pageNum = i + 1;
										} else if (currentPage <= 3) {
											pageNum = i + 1;
										} else if (currentPage >= totalPages - 2) {
											pageNum = totalPages - 4 + i;
										} else {
											pageNum = currentPage - 2 + i;
										}

										return (
											<PaginationItem key={pageNum}>
												<PaginationLink
													href="#"
													onClick={(e) => {
														e.preventDefault();
														setFilters((prev) => ({ ...prev, page: pageNum }));
													}}
													isActive={pageNum === currentPage}
												>
													{pageNum}
												</PaginationLink>
											</PaginationItem>
										);
									})}

									<PaginationItem>
										<PaginationNext
											href="#"
											onClick={(e) => {
												e.preventDefault();
												if (currentPage < totalPages) {
													setFilters((prev) => ({ ...prev, page: currentPage + 1 }));
												}
											}}
											className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default AuditLogViewer;
