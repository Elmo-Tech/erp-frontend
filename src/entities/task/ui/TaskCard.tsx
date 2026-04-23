"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { Calendar, Clock3, MoreHorizontal } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { formatDateDisplay } from "@/shared/lib/dateUtils";
import { cn } from "@/shared/lib/utils";
import { Task, TaskStatus, TaskStatusLabels, TaskTypeLabels } from "../model/types";
import { TaskPriorityBadge } from "./TaskPriorityBadge";

interface TaskCardProps {
	task: Task;
	compact?: boolean;
	isDragging?: boolean;
	isHighlighted?: boolean;
	dragHandle?: ReactNode;
	onView?: (task: Task) => void;
	onDelete?: (task: Task) => void;
	onStatusChange?: (task: Task, status: TaskStatus) => void;
	className?: string;
}

const STATUS_TONE: Record<TaskStatus, string> = {
	[TaskStatus.TODO]: "border-border text-muted-foreground",
	[TaskStatus.IN_PROGRESS]: "border-blue-200 text-blue-700 dark:border-blue-900 dark:text-blue-300",
	[TaskStatus.REVIEW]: "border-amber-200 text-amber-700 dark:border-amber-900 dark:text-amber-300",
	[TaskStatus.TESTING]: "border-purple-200 text-purple-700 dark:border-purple-900 dark:text-purple-300",
	[TaskStatus.COMPLETED]: "border-green-200 text-green-700 dark:border-green-900 dark:text-green-300",
};

export function TaskCard({ task, compact = false, isDragging = false, isHighlighted = false, dragHandle, onView, onDelete, onStatusChange, className }: TaskCardProps) {
	const assigneeLabel = task.assignees?.find((assignee) => assignee.isPrimary)?.user?.name || task.assignee?.name || task.assignees?.[0]?.user?.name || "Unassigned";
	const timeSpentHours = Math.floor((task.totalTimeSpent || 0) / 60);

	const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		if (!onView) {
			return;
		}

		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onView(task);
		}
	};

	return (
		<article
			id={`task-${task.taskId}`}
			role={onView ? "button" : undefined}
			tabIndex={onView ? 0 : undefined}
			onClick={() => onView?.(task)}
			onKeyDown={handleKeyDown}
			className={cn(
				"grid min-h-24 grid-cols-1 gap-2 border-b bg-background px-3 py-2.5 text-sm transition-colors last:border-b-0",
				onView && "cursor-pointer hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				isDragging && "opacity-50",
				isHighlighted && "ring-2 ring-ring ring-offset-2",
				compact ? "min-h-16" : "md:min-h-28",
				className
			)}
		>
			<div className="flex min-w-0 items-start justify-between gap-2">
				<div className="flex min-w-0 items-start gap-2">
					{dragHandle}
					<div className="min-w-0">
						<div className={cn("truncate font-medium leading-5", task.status === TaskStatus.COMPLETED && "line-through text-muted-foreground")}>{task.title}</div>
						{!compact && <div className="line-clamp-2 text-xs leading-5 text-muted-foreground">{task.description || "No description"}</div>}
					</div>
				</div>

				{(onStatusChange || onDelete || onView) && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label={`Open actions for ${task.title}`}
								onClick={(event) => event.stopPropagation()}
							>
								<MoreHorizontal />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							onClick={(event) => event.stopPropagation()}
						>
							{onView && <DropdownMenuItem onClick={() => onView(task)}>View</DropdownMenuItem>}
							{onStatusChange &&
								Object.values(TaskStatus).map((status) => (
									<DropdownMenuItem
										key={status}
										disabled={task.status === status}
										onClick={() => onStatusChange(task, status)}
									>
										Move to {TaskStatusLabels[status]}
									</DropdownMenuItem>
								))}
							{onDelete && (
								<DropdownMenuItem
									className="text-destructive focus:text-destructive"
									onClick={() => onDelete(task)}
								>
									Delete
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			<div className="flex flex-wrap items-center gap-1.5">
				<Badge
					variant="outline"
					className={cn("rounded-sm bg-background px-1.5 py-0 font-mono text-[11px] font-medium uppercase tracking-normal", STATUS_TONE[task.status])}
				>
					{TaskStatusLabels[task.status]}
				</Badge>
				<TaskPriorityBadge priority={task.priority} />
				<Badge
					variant="outline"
					className="rounded-sm bg-background px-1.5 py-0 font-mono text-[11px] font-medium uppercase tracking-normal text-muted-foreground"
				>
					{TaskTypeLabels[task.type]}
				</Badge>
			</div>

			<div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground sm:grid-cols-2">
				<div className="truncate">{task.project?.title || assigneeLabel}</div>
				<div className="flex flex-wrap items-center gap-3 sm:justify-end">
					<span className="inline-flex items-center gap-1 tabular-nums">
						<Calendar className="size-3" />
						{formatDateDisplay(task.dueDate)}
					</span>
					<span className="inline-flex items-center gap-1 tabular-nums">
						<Clock3 className="size-3" />
						{timeSpentHours}h
					</span>
				</div>
			</div>
		</article>
	);
}
