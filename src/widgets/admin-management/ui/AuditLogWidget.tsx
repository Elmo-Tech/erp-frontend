"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { AuditLogItem } from "@/entities/user/ui/AuditLogItem";
import { userApi } from "@/entities/user/api/user.api";
import { userKeys } from "@/entities/user/model/query-keys";
import type { AuditLogFilters } from "@/entities/user/model/types";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Pagination } from "@/shared/ui/data-display/Pagination";
import { Skeleton } from "@/shared/ui/skeleton";

export function AuditLogWidget() {
	const hasPermission = useAuthStore((state) => state.hasPermission);
	const canViewAuditLogs = hasPermission("view_audit_logs");
	const [filters, setFilters] = useState<AuditLogFilters>({ page: 1, perPage: 20 });
	const logsQuery = useQuery({
		queryKey: userKeys.auditLogs(filters),
		queryFn: () => userApi.getAuditLogs(filters),
		enabled: canViewAuditLogs,
	});

	if (!canViewAuditLogs) {
		return (
			<Alert variant="destructive">
				<AlertDescription>You do not have permission to view audit logs.</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Audit logs</h1>
				<p className="text-sm text-muted-foreground">Read-only stream of system events and security-sensitive actions.</p>
			</div>

			<Card>
				<CardHeader className="flex flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between">
					<CardTitle className="flex items-center gap-2 text-sm">
						<Activity className="size-4" />
						Events
					</CardTitle>
					<div className="flex gap-2">
						<Input
							value={filters.action ?? ""}
							onChange={(event) => setFilters((current) => ({ ...current, action: event.target.value || undefined, page: 1 }))}
							placeholder="Filter action"
							className="h-9 w-48"
						/>
						<Input
							value={filters.resourceId ?? ""}
							onChange={(event) => setFilters((current) => ({ ...current, resourceId: event.target.value ? Number(event.target.value) : undefined, page: 1 }))}
							placeholder="Resource ID"
							className="h-9 w-32"
						/>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					{logsQuery.isLoading ? (
						<div className="space-y-2 p-3">
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-12 w-full" />
						</div>
					) : logsQuery.error ? (
						<Alert variant="destructive" className="m-3">
							<AlertDescription>Failed to load audit logs.</AlertDescription>
						</Alert>
					) : logsQuery.data?.auditLogs.length ? (
						<>
							<div>
								{logsQuery.data.auditLogs.map((log) => (
									<AuditLogItem key={log.id} log={log} />
								))}
							</div>
							{logsQuery.data.pagination && (
								<Pagination
									pagination={logsQuery.data.pagination}
									onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
									className="p-3"
								/>
							)}
						</>
					) : (
						<div className="p-8 text-center text-sm text-muted-foreground">No audit events found.</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
