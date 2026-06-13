"use client";

import { Pencil, Plus, Timer, Trash2 } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { formatDateTimeDisplay } from "@/shared/lib/dateUtils";
import type { ProjectTimeEntry } from "../api/execution.api";
import { formatTaskMinutes } from "../model/task-execution-formatters";

interface TaskTimeLogsPanelProps {
	timeEntries: ProjectTimeEntry[];
	totalLogged: string;
	isDone: boolean;
	canWriteTimeEntries: boolean;
	canManageTimeEntry: (entry: ProjectTimeEntry) => boolean;
	onLogTime: () => void;
	onEditTimeEntry: (entry: ProjectTimeEntry) => void;
	onDeleteTimeEntry: (entry: ProjectTimeEntry) => void;
}

interface TimeEntryRowProps {
	entry: ProjectTimeEntry;
	canManage: boolean;
	onEdit: (entry: ProjectTimeEntry) => void;
	onDelete: (entry: ProjectTimeEntry) => void;
}

function TimeEntryRow({ entry, canManage, onEdit, onDelete }: TimeEntryRowProps) {
	const userName = entry.user?.name ?? `User #${entry.userId}`;
	const duration = entry.durationMinutes != null ? formatTaskMinutes(entry.durationMinutes) : entry.isRunning ? "Running…" : "—";

	return (
		<div className="grid grid-cols-[1fr_auto] items-start gap-3 border-b px-4 py-3 text-sm last:border-b-0">
			<div className="min-w-0">
				<p className="truncate font-medium">{userName}</p>
				<p className="mt-0.5 text-xs text-muted-foreground">
					{entry.startTime ? formatDateTimeDisplay(entry.startTime) : "—"}
					{entry.endTime ? ` → ${formatDateTimeDisplay(entry.endTime)}` : ""}
				</p>
				{entry.note && <p className="mt-0.5 text-xs italic text-muted-foreground/70">&quot;{entry.note}&quot;</p>}
			</div>
			<div className="flex shrink-0 items-center gap-2">
				{entry.isManual && (
					<Badge
						variant="outline"
						className="rounded-sm border-dashed px-1.5 py-0 text-[10px]"
					>
						Manual
					</Badge>
				)}
				{entry.isRunning && (
					<Badge
						variant="outline"
						className="animate-pulse rounded-sm border-rose-200 bg-rose-50 px-1.5 py-0 text-[10px] text-rose-600"
					>
						Live
					</Badge>
				)}
				<span className="text-xs font-medium tabular-nums">{duration}</span>
				{canManage && !entry.isRunning && (
					<div className="flex items-center gap-1">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="h-7 w-7"
							onClick={() => onEdit(entry)}
						>
							<Pencil className="size-3.5" />
							<span className="sr-only">Edit time entry</span>
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="h-7 w-7 text-destructive hover:text-destructive"
							onClick={() => onDelete(entry)}
						>
							<Trash2 className="size-3.5" />
							<span className="sr-only">Delete time entry</span>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

export function TaskTimeLogsPanel({
	timeEntries,
	totalLogged,
	isDone,
	canWriteTimeEntries,
	canManageTimeEntry,
	onLogTime,
	onEditTimeEntry,
	onDeleteTimeEntry,
}: TaskTimeLogsPanelProps) {
	return (
		<ScrollArea className="h-full">
			<div className="px-6 py-4">
				<div className="mb-4 flex items-center justify-between">
					<div>
						<h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time Entries</h4>
						<p className="mt-0.5 text-xs text-muted-foreground">
							Total logged: <span className="font-medium text-foreground">{totalLogged}</span>
						</p>
					</div>
					{!isDone && canWriteTimeEntries && (
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={onLogTime}
						>
							<Plus className="size-3.5" />
							Log Time
						</Button>
					)}
				</div>

				{timeEntries.length > 0 ? (
					<div className="overflow-hidden rounded-md border bg-background">
						{timeEntries.map((entry) => (
							<TimeEntryRow
								key={entry.entryId}
								entry={entry}
								canManage={canManageTimeEntry(entry)}
								onEdit={onEditTimeEntry}
								onDelete={onDeleteTimeEntry}
							/>
						))}
					</div>
				) : (
					<div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center">
						<Timer className="size-6 text-muted-foreground/40" />
						<p className="text-sm font-medium text-muted-foreground">No time logged yet</p>
						<p className="text-xs text-muted-foreground/70">{canWriteTimeEntries ? "Start the timer or log time manually." : "Time entries will appear here once logged."}</p>
					</div>
				)}
			</div>
		</ScrollArea>
	);
}
