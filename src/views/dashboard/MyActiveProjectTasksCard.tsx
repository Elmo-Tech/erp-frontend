"use client";

import { format } from "date-fns";
import { CheckCircle2, ListTodo } from "lucide-react";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { ExecutionTaskStatusLabels, type ExecutionTaskStatusValue, useMyActiveProjectTasks } from "@/features/projects/api/execution.api";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

interface MyActiveProjectTasksCardProps {
	className?: string;
}

function formatDate(value: string | null | undefined) {
	if (!value) return "No due date";
	return format(new Date(value), "dd MMM");
}

function normalizeStatus(status: string | null | undefined) {
	if (!status) return "Open";
	return ExecutionTaskStatusLabels[status as ExecutionTaskStatusValue] ?? status.replaceAll("_", " ");
}

export function MyActiveProjectTasksCard({ className }: MyActiveProjectTasksCardProps) {
	const currentUserId = useAuthStore((s) => s.user?.userId);
	const tasksQuery = useMyActiveProjectTasks();
	const tasks = (tasksQuery.data ?? []).filter((task) => task.assigneeId === currentUserId);

	return (
		<Card className={cn("lg:col-span-2", className)}>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<ListTodo className="size-4 text-muted-foreground" />
					My Active Tasks
				</CardTitle>
			</CardHeader>
			<CardContent>
				{tasksQuery.isLoading ? (
					<div className="space-y-2">
						<Skeleton className="h-14 w-full" />
						<Skeleton className="h-14 w-full" />
						<Skeleton className="h-14 w-full" />
					</div>
				) : tasks.length ? (
					<div className="divide-y rounded-md border">
						{tasks.map((task) => (
							<div
								key={task.taskId}
								className="flex min-w-0 flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="min-w-0">
									<p className="truncate text-sm font-medium">{task.title}</p>
									<p className="truncate text-xs text-muted-foreground">{task.project?.title ?? "Project"}</p>
								</div>
								<div className="flex shrink-0 items-center gap-2">
									<Badge variant="outline" className="capitalize">
										{normalizeStatus(task.status)}
									</Badge>
									<span className="text-xs tabular-nums text-muted-foreground">{formatDate(task.dueDate)}</span>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center">
						<CheckCircle2 className="size-5 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">No active assigned tasks.</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
