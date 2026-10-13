"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { handleApiError } from "@/lib/errorHandling";
import { attendanceApi } from "@/features/admin/api/attendance";
import type { Attendance } from "@/features/admin/types/attendance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPermissionDuration, isValidPermissionMonth } from "../lib/short-permissions";

interface Props {
	employeeId: number;
	employeeName: string;
	canManage: boolean;
	isActive: boolean;
	month?: string;
}

export function EmployeeAttendancePanel({ employeeId, canManage, isActive, month }: Props) {
	const valid = !month || isValidPermissionMonth(month);
	const endDate = month && valid ? `${month}-${new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate()}` : undefined;
	const historyQuery = useQuery({
		queryKey: ["employee-attendance", employeeId, month],
		queryFn: () => attendanceApi.getAll({ userId: employeeId, ...(month ? { startDate: `${month}-01`, endDate } : {}) }, 1, 31),
		enabled: isActive && canManage && valid,
		staleTime: 60_000,
	});

	if (!canManage) return null;

	if (historyQuery.isLoading) {
		return (
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" /> Loading attendance…
			</div>
		);
	}

	const records: Attendance[] = historyQuery.data?.attendances ?? [];

	return (
		<div className="space-y-4">
			{historyQuery.isError && <div role="alert" className="space-y-2 text-sm text-destructive"><p>{handleApiError(historyQuery.error)}</p><Button size="sm" variant="outline" onClick={() => historyQuery.refetch()}>Try again</Button></div>}
			{!historyQuery.isError && records.length === 0 ? (
				<p className="py-5 text-sm text-muted-foreground">No attendance records for this month.</p>
			) : (
				<div className="overflow-x-auto rounded-lg border">
					<table className="w-full text-sm">
						<thead className="bg-muted/50 text-left text-muted-foreground">
							<tr>
								<th className="px-3 py-2">Date</th>
								<th className="px-3 py-2">Clock in</th>
								<th className="px-3 py-2">Clock out</th>
								<th className="px-3 py-2">Work time</th>
								<th className="px-3 py-2">Status</th>
							</tr>
						</thead>
						<tbody>
							{records.map((r: Attendance) => (
								<tr key={r.attendanceId} className="border-t">
									<td className="whitespace-nowrap px-3 py-3">{r.date}</td>
									<td className="whitespace-nowrap px-3 py-3">{r.clockIn ? new Date(r.clockIn).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
									<td className="whitespace-nowrap px-3 py-3">{r.clockOut ? new Date(r.clockOut).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
									<td className="whitespace-nowrap px-3 py-3">{formatPermissionDuration(r.workedMinutes ?? 0)}</td>
									<td className="px-3 py-3"><Badge variant="outline" className={r.lateMinutes ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}>{r.isClockedIn ? "Clocked in" : r.lateMinutes ? `${r.lateMinutes}m late` : "On time"}</Badge></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
