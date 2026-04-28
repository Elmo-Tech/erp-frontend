"use client";

import { AlertCircle, Clock, Coffee, Play, RotateCcw } from "lucide-react";
import { AttendanceRecordItem } from "@/entities/attendance/ui/AttendanceRecordItem";
import { ClockInOutButton } from "@/features/attendances/ui/ClockInOutButton";
import { useAttendanceHistory, useAttendanceStatus } from "@/features/attendances/model/use-attendance-actions";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatTimeDisplay } from "@/shared/lib/dateUtils";
import { cn } from "@/shared/lib/utils";

interface EmployeeAttendanceWidgetProps {
	className?: string;
	compact?: boolean;
}

export function EmployeeAttendanceWidget({ className, compact = false }: EmployeeAttendanceWidgetProps) {
	const attendanceStatus = useAttendanceStatus();
	const historyQuery = useAttendanceHistory(undefined, undefined, compact ? 3 : 6);

	if (attendanceStatus.isLoading) {
		return (
			<section className={cn("rounded-md border bg-background p-3", className)}>
				<Skeleton className="h-5 w-40" />
				<Skeleton className="mt-4 h-20 w-full" />
			</section>
		);
	}

	if (attendanceStatus.error) {
		return (
			<section className={cn("rounded-md border bg-background p-3", className)}>
				<div className="flex items-center gap-2 text-sm text-destructive">
					<AlertCircle className="size-4" />
					<span>Unable to load attendance</span>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="ml-auto"
						onClick={() => attendanceStatus.refetch()}
					>
						<RotateCcw data-icon="inline-start" />
						Retry
					</Button>
				</div>
			</section>
		);
	}

	const statusIcon = attendanceStatus.hasActiveTimer ? Play : attendanceStatus.isClocked ? Coffee : Clock;
	const StatusIcon = statusIcon;

	return (
		<section className={cn("rounded-md border bg-background", className)}>
			<div className="flex items-start justify-between gap-3 px-3 py-3">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<StatusIcon className="size-4 text-muted-foreground" />
						<h2 className="text-sm font-semibold tracking-tight">Today&apos;s attendance</h2>
					</div>
					<p className="mt-1 text-xs text-muted-foreground">{attendanceStatus.summary.message}</p>
				</div>
				<ClockInOutButton />
			</div>

			<Separator />

			<div className="grid grid-cols-3 gap-3 px-3 py-3 text-sm">
				<Metric label="Clock in" value={formatTimeDisplay(attendanceStatus.summary.clockInTime)} />
				<Metric label="Clock out" value={formatTimeDisplay(attendanceStatus.summary.clockOutTime)} />
				<Metric label="Worked" value={attendanceStatus.summary.workedDuration} />
			</div>

			{!compact && (
				<>
					<Separator />
					<div className="px-3 py-2 text-xs font-medium text-muted-foreground">Recent history</div>
					{historyQuery.isLoading ? (
						<div className="space-y-2 px-3 pb-3">
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-12 w-full" />
						</div>
					) : historyQuery.data?.attendances.length ? (
						<div>
							{historyQuery.data.attendances.map((attendance) => (
								<AttendanceRecordItem
									key={attendance.attendanceId}
									attendance={attendance}
								/>
							))}
						</div>
					) : (
						<div className="px-3 pb-3 text-sm text-muted-foreground">No attendance records yet.</div>
					)}
				</>
			)}
		</section>
	);
}

function Metric({ label, value }: { label: string; value: string }) {
	return (
		<div className="min-w-0">
			<div className="text-xs text-muted-foreground">{label}</div>
			<div className="truncate font-mono font-medium tabular-nums">{value}</div>
		</div>
	);
}
