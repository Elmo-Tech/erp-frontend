"use client";

import Link from "next/link";
import { ArrowRight, Clock3, ListTodo, PlayCircle } from "lucide-react";
import { useActivePersonalTimeEntry, usePersonalTasks } from "@/features/personal-tasks/api/personal-tasks.api";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

function formatLoggedMinutes(minutes: number) {
	if (minutes <= 0) return "0m";
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export function PersonalTasksSummaryCard() {
	const tasksQuery = usePersonalTasks();
	const activeQuery = useActivePersonalTimeEntry();
	const tasks = tasksQuery.data ?? [];
	const openTasks = tasks.filter((task) => task.status !== "done");
	const doneTasks = tasks.filter((task) => task.status === "done");
	const openLoggedMinutes = openTasks.reduce((total, task) => total + task.totalLoggedMinutes, 0);
	const activeTask = tasks.find((task) => task.taskId === activeQuery.data?.personalTaskId);

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<ListTodo className="size-4 text-muted-foreground" />
					Personal Tasks
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{tasksQuery.isLoading ? (
					<div className="grid gap-3 sm:grid-cols-3">
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
					</div>
				) : (
					<>
						<div className="grid gap-3 sm:grid-cols-3">
							<div className="rounded-md border px-3 py-2">
								<p className="text-2xl font-semibold tabular-nums">{openTasks.length}</p>
								<p className="text-xs text-muted-foreground">Open</p>
							</div>
							<div className="rounded-md border px-3 py-2">
								<p className="text-2xl font-semibold tabular-nums">{doneTasks.length}</p>
								<p className="text-xs text-muted-foreground">Done</p>
							</div>
							<div className="rounded-md border px-3 py-2">
								<p className="text-2xl font-semibold tabular-nums">{formatLoggedMinutes(openLoggedMinutes)}</p>
								<p className="text-xs text-muted-foreground">Logged</p>
							</div>
						</div>

						{activeQuery.data?.startTime ? (
							<div className="flex min-w-0 items-center gap-2 rounded-md border border-emerald-400/30 bg-emerald-500/8 px-3 py-2 text-sm">
								<PlayCircle className="size-4 shrink-0 text-emerald-600" />
								<span className="truncate font-medium">{activeTask?.title ?? activeQuery.data.task?.title ?? "Personal task"}</span>
							</div>
						) : (
							<div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
								<Clock3 className="size-4" />
								No personal timer running
							</div>
						)}
					</>
				)}

				<Button asChild variant="outline" className="w-full justify-between">
					<Link href="/dashboard/my-tasks" aria-label="Open my tasks">
						Open My Tasks
						<ArrowRight className="size-4" />
					</Link>
				</Button>
			</CardContent>
		</Card>
	);
}
