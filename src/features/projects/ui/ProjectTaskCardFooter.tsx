"use client";

import { Clock, Pause, Play, RotateCcw, Square } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { CardFooter } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { formatDuration } from "@/shared/lib/dateUtils";
import { ExecutionTaskStatus, type ProjectTask, type TaskTimerLifecycleAction } from "../api/execution.api";
import { formatTaskLoggedTime, type TaskCardView } from "../model/task-card-view";

interface ProjectTaskCardFooterProps {
	task: ProjectTask;
	view: TaskCardView;
	elapsedSeconds: number;
	isTimerPending: boolean;
	onTimerAction: (event: React.MouseEvent, action: TaskTimerLifecycleAction) => void;
}

export function ProjectTaskCardFooter({ task, view, elapsedSeconds, isTimerPending, onTimerAction }: ProjectTaskCardFooterProps) {
	const canStartTimer = task.allowedActions?.startTimer ?? false;
	const canStopTimer = task.allowedActions?.stopTimer ?? false;
	const canHoldTask = canStopTimer && Boolean(task.allowedActions?.changeStatus);
	const showTimerControls = view.isRunning ? canStopTimer : canStartTimer;

	return (
		<CardFooter className="border-t px-4 py-2.5">
			<div className="flex w-full items-center justify-between gap-2">
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<Clock className="size-3" />
					{view.isRunning ? <span className="font-mono tabular-nums text-rose-600">{formatDuration(elapsedSeconds)}</span> : <span className="tabular-nums">{formatTaskLoggedTime(task.totalLoggedMinutes)}</span>}
				</div>

				{!view.isCompleted && task.status !== ExecutionTaskStatus.CANCELLED && showTimerControls && (
					<div className="flex items-center gap-1">
						{view.isRunning ? (
							<>
								{canHoldTask && (
									<TimerButton
										label="Hold"
										disabled={isTimerPending}
										onClick={(event) => onTimerAction(event, "hold")}
									>
										<Pause />
									</TimerButton>
								)}
								<TimerButton
									label="End"
									variant="destructive"
									disabled={isTimerPending}
									onClick={(event) => onTimerAction(event, "end")}
								>
									<Square className="fill-current" />
								</TimerButton>
							</>
						) : task.status === ExecutionTaskStatus.ON_HOLD ? (
							<TimerButton
								label="Resume"
								disabled={isTimerPending}
								onClick={(event) => onTimerAction(event, "resume")}
							>
								<RotateCcw />
							</TimerButton>
						) : (
							<TimerButton
								label="Start"
								disabled={isTimerPending}
								onClick={(event) => onTimerAction(event, "start")}
							>
								<Play className="fill-current" />
							</TimerButton>
						)}
					</div>
				)}
			</div>
		</CardFooter>
	);
}

function TimerButton({
	label,
	variant = "outline",
	disabled,
	onClick,
	children,
}: {
	label: string;
	variant?: "outline" | "destructive";
	disabled: boolean;
	onClick: (event: React.MouseEvent) => void;
	children: React.ReactNode;
}) {
	return (
		<Button
			type="button"
			size="sm"
			variant={variant}
			className={cn("h-7 gap-1 px-2 text-xs font-medium [&_svg]:size-3")}
			disabled={disabled}
			onClick={onClick}
			aria-label={`${label} timer`}
		>
			{children}
			{label}
		</Button>
	);
}
