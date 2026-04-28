"use client";

import { AttendanceRecordItem } from "@/entities/attendance/ui/AttendanceRecordItem";
import { useAllAttendance } from "@/features/attendances/model/use-attendance-actions";
import { Skeleton } from "@/shared/ui/skeleton";

export default function AdminAttendancePage() {
	const attendanceQuery = useAllAttendance({ perPage: 30 });

	return (
		<div className="container mx-auto max-w-5xl space-y-4 py-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Attendance management</h1>
				<p className="text-sm text-muted-foreground">Recent attendance records across employees.</p>
			</div>
			<section className="rounded-md border bg-background">
				{attendanceQuery.isLoading ? (
					<div className="space-y-2 p-3">
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
					</div>
				) : attendanceQuery.error ? (
					<div className="p-3 text-sm text-destructive">Unable to load attendance records.</div>
				) : attendanceQuery.data?.attendances.length ? (
					attendanceQuery.data.attendances.map((attendance) => (
						<AttendanceRecordItem
							key={attendance.attendanceId}
							attendance={attendance}
						/>
					))
				) : (
					<div className="p-3 text-sm text-muted-foreground">No attendance records found.</div>
				)}
			</section>
		</div>
	);
}
