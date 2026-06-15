"use client";

import { type FormEvent, useMemo, useState } from "react";
import { Check, Loader2, Play, Plus, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useActivePersonalTimeEntry, useCompletePersonalTask, useCreatePersonalTask, useDeletePersonalTask, usePersonalTasks, useTogglePersonalTaskTimer, type PersonalTask } from "@/features/personal-tasks/api/personal-tasks.api";
import { elapsedSecondsSince, formatElapsedTime } from "@/features/time-tracking/model/timer-format";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";

function formatLoggedMinutes(minutes: number) {
	if (minutes <= 0) return "0m";
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function statusLabel(task: PersonalTask) {
	if (task.status === "done") return "Done";
	if (task.status === "in_progress") return "In Progress";
	return "To Do";
}

interface PersonalTasksWidgetProps {
	className?: string;
}

export function PersonalTasksWidget({ className }: PersonalTasksWidgetProps) {
	const [title, setTitle] = useState("");
	const tasksQuery = usePersonalTasks();
	const activeQuery = useActivePersonalTimeEntry();
	const createTask = useCreatePersonalTask();
	const completeTask = useCompletePersonalTask();
	const deleteTask = useDeletePersonalTask();
	const toggleTimer = useTogglePersonalTaskTimer();

	const activeEntry = activeQuery.data;
	const activeTaskId = activeEntry?.personalTaskId ?? null;
	const activeTask = useMemo(() => (tasksQuery.data ?? []).find((task) => task.taskId === activeTaskId) ?? null, [activeTaskId, tasksQuery.data]);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmedTitle = title.trim();
		if (!trimmedTitle) return;

		createTask.mutate(
			{ title: trimmedTitle },
			{
				onSuccess: () => {
					setTitle("");
					toast.success("Personal task created.");
				},
				onError: () => toast.error("Failed to create personal task."),
			},
		);
	};

	const handleToggleTimer = (taskId: number) => {
		toggleTimer.mutate(taskId, {
			onError: () => toast.error("Failed to toggle personal timer."),
		});
	};

	const handleComplete = (taskId: number) => {
		completeTask.mutate(taskId, {
			onSuccess: () => toast.success("Personal task completed."),
			onError: () => toast.error("Failed to complete personal task."),
		});
	};

	const handleDelete = (taskId: number) => {
		deleteTask.mutate(taskId, {
			onSuccess: () => toast.success("Personal task deleted."),
			onError: () => toast.error("Failed to delete personal task."),
		});
	};

	const tasks = tasksQuery.data ?? [];
	const openTasks = tasks.filter((task) => task.status !== "done");
	const doneTasks = tasks.filter((task) => task.status === "done").slice(0, 4);

	return (
		<Card className={cn("lg:col-span-2", className)}>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<Plus className="size-4 text-muted-foreground" />
					Personal Tasks
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
					<Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add a personal task" className="sm:flex-1" />
					<Button type="submit" className="gap-2" disabled={createTask.isPending || !title.trim()}>
						{createTask.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
						Add
					</Button>
				</form>

				{activeEntry?.startTime && (
					<div className="flex items-center justify-between gap-3 rounded-md border border-emerald-400/30 bg-emerald-500/8 px-3 py-2">
						<div className="min-w-0">
							<p className="truncate text-sm font-medium">{activeTask?.title ?? activeEntry.task?.title ?? "Personal task"}</p>
							<p className="text-xs text-emerald-700 dark:text-emerald-300">{formatElapsedTime(elapsedSecondsSince(activeEntry.startTime))}</p>
						</div>
						<Button type="button" variant="destructive" size="sm" className="gap-2" disabled={toggleTimer.isPending} onClick={() => handleToggleTimer(activeEntry.personalTaskId)}>
							<Square className="size-3.5" />
							Stop
						</Button>
					</div>
				)}

				{tasksQuery.isLoading ? (
					<div className="space-y-2">
						<Skeleton className="h-14 w-full" />
						<Skeleton className="h-14 w-full" />
					</div>
				) : openTasks.length || doneTasks.length ? (
					<div className="max-h-[520px] divide-y overflow-y-auto rounded-md border">
						{[...openTasks, ...doneTasks].map((task) => {
							const running = activeTaskId === task.taskId;
							return (
								<div key={task.taskId} className="flex min-w-0 flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
									<div className="min-w-0">
										<p className="truncate text-sm font-medium">{task.title}</p>
										<div className="mt-1 flex flex-wrap items-center gap-2">
											<Badge variant={task.status === "done" ? "secondary" : "outline"} className="capitalize">
												{statusLabel(task)}
											</Badge>
											<span className="text-xs tabular-nums text-muted-foreground">{formatLoggedMinutes(task.totalLoggedMinutes)}</span>
										</div>
									</div>
									<div className="flex shrink-0 items-center gap-1">
										{task.status !== "done" && (
											<Button type="button" variant={running ? "destructive" : "outline"} size="icon-sm" disabled={toggleTimer.isPending} onClick={() => handleToggleTimer(task.taskId)} aria-label={running ? "Stop personal timer" : "Start personal timer"}>
												{running ? <Square className="size-3.5" /> : <Play className="size-3.5" />}
											</Button>
										)}
										{task.status !== "done" && (
											<Button type="button" variant="ghost" size="icon-sm" disabled={completeTask.isPending} onClick={() => handleComplete(task.taskId)} aria-label="Complete personal task">
												<Check className="size-3.5" />
											</Button>
										)}
										<Button type="button" variant="ghost" size="icon-sm" disabled={deleteTask.isPending} onClick={() => handleDelete(task.taskId)} aria-label="Delete personal task">
											<Trash2 className="size-3.5" />
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="flex min-h-28 items-center justify-center rounded-md border border-dashed text-center text-sm text-muted-foreground">No personal tasks yet.</div>
				)}
			</CardContent>
		</Card>
	);
}
