"use client";

/**
 * ProjectTaskCard
 *
 * Clickable card for a single ProjectTask. Renders:
 *  - Header:  Task title + status badge
 *  - Body:    Deliverable progress chip + assignee
 *  - Footer:  Live timer display + Play/Stop toggle button
 *
 * The timer button uses e.stopPropagation() so clicking it never
 * opens the TaskExecutionSheet.
 *
 * A running timer is detected by checking whether any entry in
 * task.timeEntries has isRunning === true.
 */

import { useState, useEffect, useCallback } from "react";
import { Play, Square, Clock, CheckSquare, User } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { cn } from "@/shared/lib/utils";
import { formatDuration } from "@/shared/lib/dateUtils";
import { TaskStatusColors, TaskStatusLabels, TaskStatus } from "@/shared/lib/statusHelpers";
import { useToggleTaskTimer } from "../api/execution.api";
import type { ProjectTask } from "../api/execution.api";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface ProjectTaskCardProps {
	task: ProjectTask;
	projectId: number;
	onClick: (task: ProjectTask) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Live elapsed timer hook
// ─────────────────────────────────────────────────────────────────────────────

function useLiveTimer(startTime: string | null | undefined, isRunning: boolean) {
	const [nowMs, setNowMs] = useState(() => Date.now());

	useEffect(() => {
		if (!isRunning || !startTime) {
			return;
		}

		const id = setInterval(() => {
			setNowMs(Date.now());
		}, 1000);

		return () => clearInterval(id);
	}, [isRunning, startTime]);

	if (!isRunning || !startTime) {
		return 0;
	}

	return Math.max(0, Math.floor((nowMs - new Date(startTime).getTime()) / 1000));
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
	return name
		.split(" ")
		.slice(0, 2)
		.map((n) => n[0])
		.join("")
		.toUpperCase();
}

function formatLoggedTime(totalMinutes: number): string {
	if (totalMinutes === 0) return "0m";
	const h = Math.floor(totalMinutes / 60);
	const m = totalMinutes % 60;
	if (h === 0) return `${m}m`;
	if (m === 0) return `${h}h`;
	return `${h}h ${m}m`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProjectTaskCard({ task, projectId, onClick }: ProjectTaskCardProps) {
	const toggleTimer = useToggleTaskTimer();

	// Derive running state from timeEntries array
	const runningEntry = task.timeEntries?.find((e) => e.isRunning) ?? null;
	const isRunning = runningEntry !== null;

	// Live elapsed seconds for the running entry
	const elapsedSeconds = useLiveTimer(runningEntry?.startTime, isRunning);

	// Deliverable counts
	const deliverables = task.deliverables ?? [];
	const totalDeliverables = deliverables.length;
	const completedDeliverables = deliverables.filter((d) => d.isCompleted).length;
	const allDeliverablesDone = totalDeliverables > 0 && completedDeliverables === totalDeliverables;

	// Status badge colour
	const statusColorClass = TaskStatusColors[task.status as TaskStatus] ?? "bg-gray-100 text-gray-800 border-gray-200";
	const statusLabel = TaskStatusLabels[task.status as TaskStatus] ?? task.statusLabel ?? task.status;

	const isCompleted = task.status === TaskStatus.COMPLETED || task.status === "done";

	// ── Dynamic card border/bg based on execution status ────────────────────
	const cardStatusClass = (() => {
		switch (task.status) {
			case "done":
				return "opacity-60 bg-muted/50 grayscale-[0.3]";
			case "qa":
				return "border-amber-400 shadow-sm";
			case "in_review":
				return "border-purple-400 shadow-sm";
			case "in_progress":
				return "border-blue-500 shadow-sm";
			default:
				return "";
		}
	})();

	// ── Timer toggle handler ─────────────────────────────────────────────────
	const handleTimerToggle = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			toggleTimer.mutate(
				{ projectId, taskId: task.taskId },
				{
					onError: () => toast.error("Failed to toggle timer. Please try again."),
				},
			);
		},
		[toggleTimer, projectId, task.taskId],
	);

	return (
		<Card
			role="button"
			tabIndex={0}
			aria-label={`Open task: ${task.title}`}
			onClick={() => onClick(task)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick(task);
				}
			}}
			className={cn("cursor-pointer gap-3 py-0 select-none transition-all", cardStatusClass)}
		>
			{/* ── Header ──────────────────────────────────────────────────────── */}
			<CardHeader className="px-4 pt-4 pb-0">
				<div className="flex items-start justify-between gap-2">
					<p className={cn("text-sm font-medium leading-snug", isCompleted && "line-through text-muted-foreground")}>{task.title}</p>
					<Badge
						variant="outline"
						className={cn("shrink-0 rounded-sm border px-1.5 py-0 font-mono text-[10px] uppercase tracking-wide", statusColorClass)}
					>
						{statusLabel}
					</Badge>
				</div>
			</CardHeader>

			{/* ── Body ────────────────────────────────────────────────────────── */}
			<CardContent className="px-4 py-0">
				<div className="flex items-center justify-between gap-3">
					{/* Deliverables chip */}
					{totalDeliverables > 0 ? (
						<div className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs", allDeliverablesDone ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-muted/50 text-muted-foreground")}>
							<CheckSquare className="size-3" />
							<span>
								{completedDeliverables}/{totalDeliverables}
							</span>
						</div>
					) : (
						<div className="flex items-center gap-1 text-xs text-muted-foreground/50">
							<CheckSquare className="size-3" />
							<span>No deliverables</span>
						</div>
					)}

					{/* Assignee */}
					{task.assignee ? (
						<div className="flex items-center gap-1.5">
							<Avatar className="size-5">
								{task.assignee.avatar && (
									<AvatarImage
										src={task.assignee.avatar}
										alt={task.assignee.name}
									/>
								)}
								<AvatarFallback className="text-[9px]">{getInitials(task.assignee.name)}</AvatarFallback>
							</Avatar>
							<span className="max-w-[80px] truncate text-xs text-muted-foreground">{task.assignee.name}</span>
						</div>
					) : (
						<div className="flex items-center gap-1 text-xs text-muted-foreground/40">
							<User className="size-3" />
							<span>Unassigned</span>
						</div>
					)}
				</div>
			</CardContent>

			{/* ── Footer — Timer engine ────────────────────────────────────────── */}
			<CardFooter className="border-t px-4 py-2.5">
				<div className="flex w-full items-center justify-between gap-2">
					{/* Logged time + live counter */}
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Clock className="size-3" />
						{isRunning ? <span className="font-mono tabular-nums text-rose-600">{formatDuration(elapsedSeconds)}</span> : <span className="tabular-nums">{formatLoggedTime(task.totalLoggedMinutes)}</span>}
					</div>

					{/* Play / Stop button */}
					{!isCompleted && (
						<Button
							type="button"
							size="sm"
							variant={isRunning ? "destructive" : "outline"}
							className={cn("h-7 gap-1.5 px-2.5 text-xs font-medium transition-all", isRunning && "animate-pulse")}
							disabled={toggleTimer.isPending}
							onClick={handleTimerToggle}
							aria-label={isRunning ? "Stop timer" : "Start timer"}
						>
							{isRunning ? (
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
		</Card>
	);
}
