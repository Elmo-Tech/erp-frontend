import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import type { Attendance } from "../model/types";
import { formatDateDisplay, formatTimeDisplay } from "@/shared/lib/dateUtils";
import { formatMinutesCompact } from "@/shared/lib/time";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

interface AttendanceRecordItemProps {
	attendance: Attendance;
	className?: string;
}

export function AttendanceRecordItem({ attendance, className }: AttendanceRecordItemProps) {
	const isOpen = Boolean(attendance.clockIn && !attendance.clockOut);
	const isLate = attendance.lateMinutes > 0 || attendance.isLate;

	return (
		<div className={cn("flex items-center justify-between gap-3 border-b px-3 py-2.5 last:border-b-0", className)}>
			<div className="min-w-0">
				<div className="flex items-center gap-2">
					<Clock className="size-3.5 text-muted-foreground" />
					<p className="text-sm font-medium">{formatDateDisplay(attendance.date)}</p>
					{isOpen ? (
						<Badge variant="secondary">Active</Badge>
					) : isLate ? (
						<Badge
							variant="outline"
							className="border-amber-300 text-amber-700"
						>
							Late {attendance.lateMinutes}m
						</Badge>
					) : (
						<Badge
							variant="outline"
							className="border-green-300 text-green-700"
						>
							Complete
						</Badge>
					)}
				</div>
				<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
					<span>In {formatTimeDisplay(attendance.clockIn)}</span>
					<span>Out {formatTimeDisplay(attendance.clockOut)}</span>
					<span>Worked {formatMinutesCompact(attendance.workedMinutes)}</span>
				</div>
			</div>
			{isLate ? <AlertCircle className="size-4 shrink-0 text-amber-600" /> : <CheckCircle2 className="size-4 shrink-0 text-green-600" />}
		</div>
	);
}
