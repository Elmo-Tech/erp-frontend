"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { useTaskTimerLifecycle, type TaskTimerLifecycleAction } from "../api/execution.api";
import type { ProjectTask } from "../api/execution.api";
import { buildTaskCardView } from "../model/task-card-view";
import { ProjectTaskCardBody } from "./ProjectTaskCardBody";
import { ProjectTaskCardFooter } from "./ProjectTaskCardFooter";
import { ProjectTaskCardHeader } from "./ProjectTaskCardHeader";

export interface ProjectTaskCardProps {
	task: ProjectTask;
	projectId: number;
	onClick: (task: ProjectTask) => void;
	canEdit?: boolean;
	canDelete?: boolean;
	onEdit?: (task: ProjectTask) => void;
	onDelete?: (task: ProjectTask) => void;
}

function useLiveTimer(startTime: string | null | undefined, isRunning: boolean) {
	const [nowMs, setNowMs] = useState(() => Date.now());

	useEffect(() => {
		if (!isRunning || !startTime) return;

		const intervalId = setInterval(() => {
			setNowMs(Date.now());
		}, 1000);

		return () => clearInterval(intervalId);
	}, [isRunning, startTime]);

	if (!isRunning || !startTime) {
		return 0;
	}

	return Math.max(0, Math.floor((nowMs - new Date(startTime).getTime()) / 1000));
}

export function ProjectTaskCard({ task, projectId, onClick, canEdit = false, canDelete = false, onEdit, onDelete }: ProjectTaskCardProps) {
	const timerLifecycle = useTaskTimerLifecycle();
	const currentUserId = useAuthStore((state) => state.user?.userId);
	const view = buildTaskCardView(task, currentUserId);
	const elapsedSeconds = useLiveTimer(view.runningEntry?.startTime, view.isRunning);
	const canEditTask = task.allowedActions?.edit ?? canEdit;
	const canDeleteTask = task.allowedActions?.delete ?? canDelete;

	const handleTimerAction = useCallback(
		(event: React.MouseEvent, action: TaskTimerLifecycleAction) => {
			event.stopPropagation();
			timerLifecycle.mutate(
				{ projectId, taskId: task.taskId, action },
				{
					onError: () => toast.error("Timer action failed. Please try again."),
				},
			);
		},
		[timerLifecycle, projectId, task.taskId],
	);

	const handleEdit = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			onEdit?.(task);
		},
		[onEdit, task],
	);

	const handleDelete = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			onDelete?.(task);
		},
		[onDelete, task],
	);

	return (
		<Card
			role="button"
			tabIndex={0}
			aria-label={`Open task: ${task.title}`}
			onClick={() => onClick(task)}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onClick(task);
				}
			}}
			className={cn("cursor-pointer gap-3 py-0 select-none transition-all", view.cardStatusClass)}
		>
			{task.coverImageUrl && (
				<div
					role="img"
					aria-label={`${task.title} cover`}
					className="h-32 w-full rounded-t-xl bg-cover bg-center"
					style={{ backgroundImage: `url("${task.coverImageUrl}")` }}
				/>
			)}
			<ProjectTaskCardHeader
				task={task}
				view={view}
				canEdit={canEditTask}
				canDelete={canDeleteTask}
				onEditClick={handleEdit}
				onDeleteClick={handleDelete}
			/>
			<ProjectTaskCardBody
				task={task}
				view={view}
			/>
			<ProjectTaskCardFooter
				task={task}
				view={view}
				elapsedSeconds={elapsedSeconds}
				isTimerPending={timerLifecycle.isPending}
				onTimerAction={handleTimerAction}
			/>
		</Card>
	);
}
