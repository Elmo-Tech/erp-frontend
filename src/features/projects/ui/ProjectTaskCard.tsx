"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { useToggleTaskTimer } from "../api/execution.api";
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
	const toggleTimer = useToggleTaskTimer();
	const view = buildTaskCardView(task);
	const elapsedSeconds = useLiveTimer(view.runningEntry?.startTime, view.isRunning);

	const handleTimerToggle = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			toggleTimer.mutate(
				{ projectId, taskId: task.taskId },
				{
					onError: () => toast.error("Failed to toggle timer. Please try again."),
				},
			);
		},
		[toggleTimer, projectId, task.taskId],
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
			<ProjectTaskCardHeader
				task={task}
				view={view}
				canEdit={canEdit}
				canDelete={canDelete}
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
				isTimerPending={toggleTimer.isPending}
				onTimerToggle={handleTimerToggle}
			/>
		</Card>
	);
}
