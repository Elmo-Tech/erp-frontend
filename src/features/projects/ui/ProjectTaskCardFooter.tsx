"use client";

import { Clock, Play, Square } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { CardFooter } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { formatDuration } from "@/shared/lib/dateUtils";
import type { ProjectTask } from "../api/execution.api";
import { formatTaskLoggedTime, type TaskCardView } from "../model/task-card-view";

interface ProjectTaskCardFooterProps {
	task: ProjectTask;
	view: TaskCardView;
	elapsedSeconds: number;
	isTimerPending: boolean;
	onTimerToggle: (event: React.MouseEvent) => void;
}

export function ProjectTaskCardFooter({ task, view, elapsedSeconds, isTimerPending, onTimerToggle }: ProjectTaskCardFooterProps) {
	return (
		<CardFooter className="border-t px-4 py-2.5">
			<div className="flex w-full items-center justify-between gap-2">
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<Clock className="size-3" />
					{view.isRunning ? <span className="font-mono tabular-nums text-rose-600">{formatDuration(elapsedSeconds)}</span> : <span className="tabular-nums">{formatTaskLoggedTime(task.totalLoggedMinutes)}</span>}
				</div>

				{!view.isCompleted && (
					<Button
						type="button"
						size="sm"
						variant={view.isRunning ? "destructive" : "outline"}
						className={cn("h-7 gap-1.5 px-2.5 text-xs font-medium transition-all", view.isRunning && "animate-pulse")}
						disabled={isTimerPending}
						onClick={onTimerToggle}
						aria-label={view.isRunning ? "Stop timer" : "Start timer"}
					>
						{view.isRunning ? (
							<>
								<Square className="size-3 fill-current" />
								Stop
							</>
						) : (
							<>
								<Play className="size-3 fill-current" />
								Start
							</>
						)}
					</Button>
				)}
			</div>
		</CardFooter>
	);
}
