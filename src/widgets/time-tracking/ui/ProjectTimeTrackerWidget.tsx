"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Loader2, Timer } from "lucide-react";
import { taskApi } from "@/entities/task/api/task.api";
import { taskKeys } from "@/entities/task/model/query-keys";
import type { Task } from "@/entities/task/model/types";
import { TimeLogEntry } from "@/entities/time-entry/ui/TimeLogEntry";
import { TrackableType } from "@/entities/time-entry/model/types";
import { TimeTrackerToggle } from "@/features/time-entries/ui/TimeTrackerToggle";
import { useTimeEntries } from "@/features/time-entries/model/use-time-entry-actions";
import { formatMinutesCompact, toApiTrackableType } from "@/shared/lib/time";
import { cn } from "@/shared/lib/utils";

interface ProjectTimeTrackerWidgetProps {
	projectId: number;
	projectTitle?: string;
	className?: string;
}

const DEFAULT_PER_PAGE = 100;

function flattenTasks(tasks: Task[]): Task[] {
	return tasks.flatMap((task) => [task, ...flattenTasks(task.children ?? [])]);
}

export function ProjectTimeTrackerWidget({ projectId, projectTitle, className }: ProjectTimeTrackerWidgetProps) {
	const tasksQuery = useQuery({
		queryKey: taskKeys.projectTasks(projectId, 1, DEFAULT_PER_PAGE),
		queryFn: () => taskApi.getProjectTasks(projectId, 1, DEFAULT_PER_PAGE),
		enabled: Boolean(projectId),
		staleTime: 5 * 60 * 1000,
	});
	const projectTasks = useMemo(() => flattenTasks(tasksQuery.data?.tasks ?? []), [tasksQuery.data?.tasks]);
	const projectTaskIds = useMemo(() => new Set(projectTasks.map((task) => task.taskId)), [projectTasks]);
	const startableTask = projectTasks.find((task) => task.canStartTimer && !task.hasChildren) ?? projectTasks.find((task) => task.canStartTimer) ?? null;
	const timeEntriesQuery = useTimeEntries({ trackableType: toApiTrackableType(TrackableType.TASK), perPage: DEFAULT_PER_PAGE });
	const timeEntries = (timeEntriesQuery.data?.timeEntries ?? []).filter((entry) => projectTaskIds.has(entry.trackableId));
	const totalMinutes = timeEntries.reduce((total, entry) => total + (entry.durationMinutes ?? 0), 0);
	const isLoading = tasksQuery.isLoading || timeEntriesQuery.isLoading;
	const hasError = tasksQuery.error || timeEntriesQuery.error;

	return (
		<section className={cn("rounded-md border bg-background", className)}>
			<div className="flex flex-col gap-3 px-3 py-3 md:flex-row md:items-start md:justify-between">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<Timer className="size-4 text-muted-foreground" />
						<h2 className="text-sm font-semibold tracking-tight">Project time tracker</h2>
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						{timeEntries.length ? `${timeEntries.length} entries / ${formatMinutesCompact(totalMinutes)} logged` : "No tracked time yet"}
					</p>
				</div>
				{startableTask ? (
					<TimeTrackerToggle
						trackableId={startableTask.taskId}
						trackableType={TrackableType.TASK}
						trackableDisplayName={startableTask.title}
					/>
				) : (
					<TimeTrackerToggle
						trackableId={0}
						trackableType={TrackableType.TASK}
						trackableDisplayName={projectTitle}
						disabled
					/>
				)}
			</div>

			{isLoading ? (
				<div className="flex items-center gap-2 border-t px-3 py-6 text-sm text-muted-foreground">
					<Loader2 className="size-4 animate-spin" />
					Loading time entries
				</div>
			) : hasError ? (
				<div className="border-t px-3 py-6 text-sm text-destructive">Unable to load time entries.</div>
			) : timeEntries.length ? (
				<div className="border-t">
					{timeEntries.slice(0, 8).map((entry) => (
						<TimeLogEntry
							key={entry.timeEntryId}
							entry={entry}
						/>
					))}
				</div>
			) : (
				<div className="flex items-center gap-2 border-t px-3 py-6 text-sm text-muted-foreground">
					<Clock className="size-4" />
					Time logs will appear here.
				</div>
			)}
		</section>
	);
}
