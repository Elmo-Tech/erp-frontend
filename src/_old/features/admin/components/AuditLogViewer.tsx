/**
 * AuditLogViewer Component
 * Component for viewing and filtering audit logs with security-sensitive action highlighting.
 *
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { DataTable } from "@/shared/ui/data-display/DataTable";
import { SearchInput } from "@/shared/ui/filters/SearchInput";
import { FilterSelect, FilterOption } from "@/shared/ui/filters/FilterSelect";
import { FilterBar } from "@/shared/ui/filters/FilterBar";
import { DatePicker } from "@/shared/ui/forms/DatePicker";
import { Clock, User, AlertTriangle, Settings, AlertCircle, RefreshCw, Filter } from "lucide-react";
import { useAuditLogs, useAuditLogActionTypes } from "../hooks/useAuditLogs";
import { useAdminPermissions } from "../hooks";
import { AuditLogFilters } from "../types";
import { getAuditLogsColumns, isSecuritySensitive } from "./columns/auditLogsColumns";

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

	// Handle filter changes
	const handleFilterChange = (key: keyof AuditLogFilters, value: string | number | undefined) => {
		setFilters((prev) => ({
			...prev,
			[key]: value || undefined,
			page: 1,
		}));
	};

	const handlePageChange = (page: number) => {
		setFilters((prev) => ({ ...prev, page }));
	};

	const handleClearFilters = () => {
		setFilters({ page: 1, perPage: 20 });
	};

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

	// Action type options for filter
	const actionOptions: FilterOption[] = actionTypes.map((action) => ({
		value: action,
		label: formatAction(action),
	}));

	// Get columns
	const columns = getAuditLogsColumns();

	// Statistics
	const sensitiveActionsCount = data?.auditLogs?.filter((log) => isSecuritySensitive(log.action)).length || 0;
	const uniqueUsers = new Set(data?.auditLogs?.map((log) => log.userName) || []).size;
	const uniqueActions = new Set(data?.auditLogs?.map((log) => log.action) || []).size;

	// Count active filters
	const activeFiltersCount = Object.keys(filters).filter((key) => key !== "page" && key !== "perPage" && filters[key as keyof AuditLogFilters]).length;

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
						<div className="text-2xl font-bold">{data?.pagination?.total?.toLocaleString() || 0}</div>
						<p className="text-xs text-muted-foreground">
							Showing {data?.auditLogs?.length || 0} of {data?.pagination?.total || 0}
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

			{/* Audit Log Table */}
			<DataTable
				title="Audit Logs"
				titleBadge={data?.pagination ? `${data.pagination.total} logs` : undefined}
				columns={columns}
				data={data?.auditLogs || []}
				keyExtractor={(log) => log.id}
				isLoading={isLoading}
				error={error}
				pagination={data?.pagination}
				onPageChange={handlePageChange}
				emptyState={{
					icon: Clock,
					title: "No audit logs found",
					description: "Try adjusting your filters or check back later",
				}}
				headerActions={
					<FilterBar
						actions={
							<div className="flex items-center gap-2">
								{activeFiltersCount > 0 && (
									<Button
										variant="outline"
										size="sm"
										onClick={handleClearFilters}
									>
										Clear ({activeFiltersCount})
									</Button>
								)}
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
						}
					>
						<SearchInput
							value={filters.resourceId?.toString()}
							onChange={(value) => handleFilterChange("resourceId", value ? parseInt(value) : undefined)}
							placeholder="Search by Resource ID..."
							className="w-40"
						/>
						<FilterSelect
							value={filters.action}
							onChange={(value) => handleFilterChange("action", value)}
							options={actionOptions}
							placeholder="All Actions"
							icon={Filter}
							disabled={actionTypesLoading}
						/>
						<div className="flex items-center gap-2">
							<DatePicker
								value={filters.dateFrom || ""}
								onChange={(value) => handleFilterChange("dateFrom", value)}
								placeholder="From date"
								className="w-[140px]"
							/>
							<span className="text-muted-foreground">to</span>
							<DatePicker
								value={filters.dateTo || ""}
								onChange={(value) => handleFilterChange("dateTo", value)}
								placeholder="To date"
								className="w-[140px]"
							/>
						</div>
					</FilterBar>
				}
			/>
		</div>
	);
};

export default AuditLogViewer;
