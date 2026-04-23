"use client";

import type { ReactNode } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { Task, TaskDragPayload, TaskStatusDropPayload } from "@/entities/task/model/types";
import { TaskStatus, TaskStatusLabels } from "@/entities/task/model/types";

interface ChangeTaskStatusDropzoneProps {
	status: TaskStatus;
	count: number;
	children: ReactNode;
	disabled?: boolean;
	className?: string;
}

interface DraggableTaskCardProps {
	task: Task;
	children: (state: { isDragging: boolean; dragHandle: ReactNode }) => ReactNode;
	disabled?: boolean;
}

const COLUMN_TONE: Record<TaskStatus, string> = {
	[TaskStatus.TODO]: "border-border bg-muted/20",
	[TaskStatus.IN_PROGRESS]: "border-blue-200 bg-blue-50/40 dark:border-blue-950 dark:bg-blue-950/20",
	[TaskStatus.REVIEW]: "border-amber-200 bg-amber-50/40 dark:border-amber-950 dark:bg-amber-950/20",
	[TaskStatus.TESTING]: "border-purple-200 bg-purple-50/40 dark:border-purple-950 dark:bg-purple-950/20",
	[TaskStatus.COMPLETED]: "border-green-200 bg-green-50/40 dark:border-green-950 dark:bg-green-950/20",
};

export function getTaskDragPayload(task: Task): TaskDragPayload {
	return {
		type: "task",
		taskId: task.taskId,
		fromStatus: task.status,
	};
}

export function getTaskStatusDropPayload(status: TaskStatus): TaskStatusDropPayload {
	return {
		type: "task-status",
		status,
	};
}

export function isTaskDragPayload(value: unknown): value is TaskDragPayload {
	return Boolean(value && typeof value === "object" && "type" in value && value.type === "task" && "taskId" in value && "fromStatus" in value);
}

export function isTaskStatusDropPayload(value: unknown): value is TaskStatusDropPayload {
	return Boolean(value && typeof value === "object" && "type" in value && value.type === "task-status" && "status" in value);
}

export function ChangeTaskStatusDropzone({ status, count, children, disabled = false, className }: ChangeTaskStatusDropzoneProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: `task-status:${status}`,
		data: getTaskStatusDropPayload(status),
		disabled,
	});

	return (
		<section className={cn("flex min-h-96 w-72 shrink-0 flex-col overflow-hidden rounded-md border", COLUMN_TONE[status], isOver && "ring-2 ring-ring ring-offset-2", className)}>
			<div className="flex items-center justify-between border-b bg-background/75 px-3 py-2">
				<h3 className="text-sm font-medium">{TaskStatusLabels[status]}</h3>
				<Badge
					variant="secondary"
					className="rounded-sm px-1.5 py-0 text-xs tabular-nums"
				>
					{count}
				</Badge>
			</div>

			<div
				ref={setNodeRef}
				className="flex min-h-80 flex-1 flex-col gap-2 p-2"
			>
				{children}
			</div>
		</section>
	);
}

export function DraggableTaskCard({ task, children, disabled = false }: DraggableTaskCardProps) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: `task:${task.taskId}`,
		data: getTaskDragPayload(task),
		disabled,
	});

	const style = {
		transform: CSS.Translate.toString(transform),
	};

	const dragHandle = (
		<button
			type="button"
			aria-label={`Drag ${task.title}`}
			className="mt-0.5 cursor-grab rounded-sm p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
			onClick={(event) => event.stopPropagation()}
			{...attributes}
			{...listeners}
		>
			<GripVertical className="size-3.5" />
		</button>
	);

	return (
		<div
			ref={setNodeRef}
			style={style}
		>
			{children({ isDragging, dragHandle })}
		</div>
	);
}
