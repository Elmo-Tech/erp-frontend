"use client";

import { Loader2 } from "lucide-react";
import { useTaskSupervisionSummary } from "@/features/dashboard/hooks/useTaskSupervision";

interface Props {
	employeeId: number;
	employeeName: string;
	canManage: boolean;
	isActive: boolean;
}

export function EmployeeSupervisionPanel({ employeeId, canManage, isActive }: Props) {
	const summaryQuery = useTaskSupervisionSummary({ supervisorId: employeeId }, isActive && canManage);
	const summary = summaryQuery.data?.summary;

	if (!canManage) return null;

	if (summaryQuery.isLoading) {
		return (
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" /> Loading supervision…
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="grid gap-3 sm:grid-cols-3">
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Sessions</p>
					<p className="mt-1 text-xl font-semibold">{summary?.totalSessions ?? 0}</p>
				</div>
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Supervision minutes</p>
					<p className="mt-1 text-xl font-semibold">{summary?.totalDurationMinutes ?? 0}</p>
				</div>
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Help requests</p>
					<p className="mt-1 text-xl font-semibold">{summary?.totalHelpRequests ?? 0}</p>
				</div>
			</div>
			<p className="text-sm text-muted-foreground">
				Supervision time is tracked separately and never added to normal work hours. Full per-task detail lives on the task itself.
			</p>
		</div>
	);
}
