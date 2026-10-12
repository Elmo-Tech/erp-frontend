"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { handleApiError } from "@/lib/errorHandling";
import { attendanceApi } from "@/features/admin/api/attendance";
import type { Attendance } from "@/features/admin/types/attendance";

interface Props {
	employeeId: number;
	employeeName: string;
	canManage: boolean;
	isActive: boolean;
}

export function EmployeeAttendancePanel({ employeeId, canManage, isActive }: Props) {
	const historyQuery = useQuery({
		queryKey: ["employee-attendance", employeeId],
		queryFn: () => attendanceApi.getAll({ userId: employeeId }, 1, 31),
		enabled: isActive && canManage,
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
			{historyQuery.isError && <p role="alert" className="text-sm text-destructive">{handleApiError(historyQuery.error)}</p>}
			{records.length === 0 ? (
				<p className="text-sm text-muted-foreground">No attendance records in this view. Full history lives on the Attendance page.</p>
			) : (
				<div className="overflow-x-auto rounded-lg border">
					<table className="w-full text-sm">
						<thead className="bg-muted/50 text-left text-muted-foreground">
							<tr>
								<th className="px-3 py-2">Date</th>
								<th className="px-3 py-2">Clock in</th>
								<th className="px-3 py-2">Late (min)</th>
								<th className="px-3 py-2">Worked (min)</th>
							</tr>
						</thead>
						<tbody>
							{records.map((r: Attendance) => (
								<tr key={r.attendanceId} className="border-t">
									<td className="px-3 py-2">{r.date}</td>
									<td className="px-3 py-2">{r.clockIn ?? "—"}</td>
									<td className="px-3 py-2">{r.lateMinutes ?? 0}</td>
									<td className="px-3 py-2">{r.workedMinutes ?? "—"}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
