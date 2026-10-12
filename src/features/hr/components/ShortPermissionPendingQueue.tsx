"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { handleApiError } from "@/lib/errorHandling";
import { usePendingEmployeeShortPermissions } from "../hooks/useEmployeeShortPermissions";
import { formatPermissionDuration } from "../lib/short-permissions";
import type { PendingEmployeeShortPermission, PermissionCompensationType } from "../types/short-permissions";

interface ShortPermissionPendingQueueProps {
	isActive: boolean;
	onReview: (permission: PendingEmployeeShortPermission, compensationType?: PermissionCompensationType) => void;
	onView: (permission: PendingEmployeeShortPermission) => void;
}

export function ShortPermissionPendingQueue({ isActive, onReview, onView }: ShortPermissionPendingQueueProps) {
	const query = usePendingEmployeeShortPermissions(isActive);
	return <section aria-label="Pending short permissions" className="space-y-3">
		<h3 className="font-semibold">All pending short permissions</h3>
		<p className="text-sm text-muted-foreground">Requests in your reviewer scope across all employees and dates, including your own requests.</p>
		{query.isLoading ? <Skeleton className="h-24 w-full" /> : query.isError ? <div role="alert">
			<p>{handleApiError(query.error)}</p><Button variant="outline" onClick={() => void query.refetch()}>Refresh pending requests</Button>
		</div> : query.data?.length ? query.data.map((permission) => <div key={permission.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
			<div><p className="font-medium">{permission.employee.name}</p><p className="text-sm">{permission.permissionDate} {permission.startTime}–{permission.endTime} · Pending · {formatPermissionDuration(permission.durationMinutes)}</p></div>
			{permission.canReview ? <div className="flex gap-2">
				<Button size="sm" onClick={() => onReview(permission)}>Approve</Button>
				<Button size="sm" variant="outline" onClick={() => onReview(permission, "paid")}>Mark as Paid</Button>
			</div> : <div className="space-y-1"><p className="text-sm text-muted-foreground">Awaiting another authorized reviewer</p><Button size="sm" variant="outline" onClick={() => onView(permission)}>View request</Button></div>}
		</div>) : <p className="text-sm text-muted-foreground">No pending short permission requests in your reviewer scope.</p>}
	</section>;
}
