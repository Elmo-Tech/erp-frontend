import { Clock, Timer } from "lucide-react";
import type { TimeEntry } from "../model/types";
import { formatDateTimeDisplay } from "@/shared/lib/dateUtils";
import { formatMinutesCompact, getElapsedMinutes, getTrackableTypeLabel } from "@/shared/lib/time";
import { cn } from "@/shared/lib/utils";

interface TimeLogEntryProps {
	entry: TimeEntry;
	className?: string;
}

export function TimeLogEntry({ entry, className }: TimeLogEntryProps) {
	const isActive = entry.endTime === null || entry.isActive;
	const durationMinutes = isActive ? getElapsedMinutes(entry.startTime) : entry.durationMinutes ?? 0;

	return (
		<div className={cn("flex min-w-0 items-start justify-between gap-3 border-b px-3 py-2.5 last:border-b-0", className)}>
			<div className="min-w-0 space-y-1">
				<div className="flex min-w-0 items-center gap-2">
					{isActive ? <Timer className="size-3.5 text-green-600" /> : <Clock className="size-3.5 text-muted-foreground" />}
					<p className="truncate text-sm font-medium">{entry.trackableDisplayName}</p>
				</div>
				<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
					<span>{getTrackableTypeLabel(entry.trackableType)}</span>
					<span>{formatDateTimeDisplay(entry.startTime)}</span>
					{entry.user?.name && <span>{entry.user.name}</span>}
				</div>
			</div>
			<div className="shrink-0 text-right">
				<div className="font-mono text-sm font-medium tabular-nums">{formatMinutesCompact(durationMinutes)}</div>
				{isActive && <div className="text-xs text-green-600">Running</div>}
			</div>
		</div>
	);
}
