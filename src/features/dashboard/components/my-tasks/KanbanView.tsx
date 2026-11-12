/**
 * Kanban View Component
 * Drag and drop kanban board for tasks
 * Shows only "leaf tasks" (tasks that can have timer started - no children)
 * Tasks are pre-grouped by their own status from MyTasksPage
 */

import { useMyTaskAccess } from "./useMyTaskAccess";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { format, isBefore, isToday, isTomorrow, parseISO, startOfToday } from "date-fns";
import { MoreVertical, Eye, Folder, Calendar, Clock, Timer, Play, Square, Loader2 } from "lucide-react";
import { Task, TaskStatus, TaskStatusLabels, TaskPriorityLabels, TaskType, TaskTypeLabels } from "../../types/task";
import { KanbanColumns, PriorityColors, PriorityBorderColors } from "./constants";
import { StatusIcons } from "./StatusIcons";
import { useTimerStore } from "@/store/timerStore";
import { useStartTimer, useStopTimer } from "@/features/sales/hooks";
import { TrackableType } from "@/features/sales/types";
import { toast } from "sonner";
import { getRoleLabel } from "@/config/simplification";
import React, { useEffect } from "react";

interface KanbanViewProps {
	tasksByStatus: Record<TaskStatus, Task[]>;
	currentUserId?: number;
	highlightedTaskId?: number | null;
	onStatusChange: (task: Task, status: TaskStatus) => void;
	onViewTask: (task: Task) => void;
}

export function KanbanView({ tasksByStatus, currentUserId, highlightedTaskId, onStatusChange, onViewTask }: KanbanViewProps) {
	const { activeTimers } = useTimerStore();
	const startTimer = useStartTimer();
	const stopTimer = useStopTimer();

	// Tasks are already leaf tasks grouped by their own status from MyTasksPage
	// No need to extract again

	// Check if active timer is for a task using global store (real-time)
	const activeTaskIds = activeTimers.filter((timer) => timer.trackableType.toLowerCase().includes("task")).map((timer) => Number(timer.trackableId));

	// Auto-scroll to highlighted task
	useEffect(() => {
		if (highlightedTaskId) {
			const element = document.getElementById(`task-${highlightedTaskId}`);
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}
	}, [highlightedTaskId]);

	const handleStartTimer = async (task: Task) => {
		if (activeTimers.length >= 2) {
			toast.error("Pause or stop one of your two timers first");
			return;
		}
		try {
			await startTimer.mutateAsync({
				trackableType: "task" as TrackableType,
				trackableId: task.taskId,
			});
			toast.success(`Timer started for "${task.title}"`);
		} catch {
			toast.error("Failed to start timer");
		}
	};

	const handleStopTimer = async (taskId: number) => {
		try {
			await stopTimer.mutateAsync(activeTimers.find((timer) => timer.trackableType.toLowerCase().includes("task") && Number(timer.trackableId) === taskId)?.timeEntryId);
			toast.success("Timer stopped");
		} catch {
			toast.error("Failed to stop timer");
		}
	};

	return (
		<div className="flex gap-4 overflow-x-auto pb-4">
			{KanbanColumns.map((column) => (
				<div
					key={column.status}
					className="shrink-0 w-80"
				>
					{/* Column Header */}
					<div className={cn("rounded-t-xl p-3 border-b-2", column.color, column.borderColor)}>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								{StatusIcons[column.status]}
								<h3 className={cn("font-semibold", column.headerColor)}>{column.label}</h3>
							</div>
							<Badge
								variant="secondary"
								className="text-xs font-medium"
							>
								{tasksByStatus[column.status].length}
							</Badge>
						</div>
					</div>

					{/* Column Content */}
					<div className={cn("rounded-b-xl border border-t-0", column.borderColor, column.color)}>
						<DroppableColumn status={column.status}>
							{tasksByStatus[column.status].map((task) => (
								<DraggableCard
									key={task.taskId}
									task={task}
								>
									<KanbanCard
										task={task}
										currentUserId={currentUserId}
										isHighlighted={highlightedTaskId === task.taskId}
										onStatusChange={onStatusChange}
										onViewTask={onViewTask}
										activeTaskIds={activeTaskIds}
										hasActiveTimer={activeTimers.length >= 2}
										onStartTimer={handleStartTimer}
										onStopTimer={handleStopTimer}
										isTimerLoading={startTimer.isPending || stopTimer.isPending}
									/>
								</DraggableCard>
							))}
							{tasksByStatus[column.status].length === 0 && <div className="flex h-32 items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg m-1">Drop tasks here</div>}
						</DroppableColumn>
					</div>
				</div>
			))}
		</div>
	);
}

// Droppable Column
function DroppableColumn({ status, children }: { status: TaskStatus; children: React.ReactNode }) {
	const { setNodeRef, isOver } = useDroppable({ id: status });

	return (
		<div
			ref={setNodeRef}
			className={cn("min-h-[400px] rounded-lg p-2 space-y-2 transition-colors", isOver && "bg-primary/5 ring-2 ring-primary/20")}
		>
			{children}
		</div>
	);
}

// Draggable Card Wrapper
function DraggableCard({ task, children }: { task: Task; children: React.ReactNode }) {
	const access = useMyTaskAccess();
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.taskId, disabled: !access.canEdit(task) });

	const style = {
		transform: CSS.Translate.toString(transform),
	};

	// When dragging, show a placeholder to maintain space
	if (isDragging) {
		return <div className="h-[140px] rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 animate-pulse" />;
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
		>
			{children}
		</div>
	);
}

// Kanban Card
function KanbanCard({
	task,
	currentUserId,
	isHighlighted,
	onStatusChange,
	onViewTask,
	activeTaskIds,
	hasActiveTimer,
	onStartTimer,
	onStopTimer,
	isTimerLoading,
}: {
	task: Task;
	currentUserId?: number;
	isHighlighted?: boolean;
	onStatusChange: (task: Task, status: TaskStatus) => void;
	onViewTask: (task: Task) => void;
	activeTaskIds: number[];
	hasActiveTimer: boolean;
	onStartTimer: (task: Task) => void;
	onStopTimer: (taskId: number) => void;
	isTimerLoading: boolean;
}) {
	const access = useMyTaskAccess();
	const isOverdue = task.dueDate && isBefore(parseISO(task.dueDate), startOfToday()) && task.status !== TaskStatus.COMPLETED;
	const isDueToday = task.dueDate && isToday(parseISO(task.dueDate));
	const isDueTomorrow = task.dueDate && isTomorrow(parseISO(task.dueDate));
	const myAssignment = task.assignees?.find((a) => a.userId === currentUserId);
	const isTimerRunningOnThis = activeTaskIds.includes(task.taskId);
	const isTimerRunningOnOther = hasActiveTimer && !isTimerRunningOnThis;

	return (
		<Card
			id={`task-${task.taskId}`}
			className={cn(
				"cursor-grab active:cursor-grabbing transition-all hover:shadow-md border-l-4 group",
				PriorityBorderColors[task.priority],
				task.status === TaskStatus.COMPLETED && "opacity-60",
				isTimerRunningOnThis && "ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20",
				isHighlighted && "ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 animate-pulse"
			)}
		>
			<CardContent className="p-3 space-y-2">
				{/* Header with timer indicator and menu */}
				<div className="flex items-start justify-between gap-2">
					<div className="flex items-center gap-2 flex-1 min-w-0">
						{isTimerRunningOnThis && (
							<div className="flex items-center gap-1 shrink-0">
								<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
								<Timer className="h-3 w-3 text-green-600" />
							</div>
						)}
						<h4 className={cn("font-medium text-sm line-clamp-2 flex-1", task.status === TaskStatus.COMPLETED && "line-through")}>{task.title}</h4>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								aria-label={`Actions for ${task.title}`}
								variant="ghost"
								size="sm"
								className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
								onClick={(e) => e.stopPropagation()}
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							onClick={(e) => e.stopPropagation()}
						>
							<DropdownMenuItem onClick={() => onViewTask(task)}>
								<Eye className="h-4 w-4 mr-2" />
								View Details
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Move to</div>
							{Object.values(TaskStatus).map((status) => (
								<DropdownMenuItem
									key={status}
									disabled={!access.canEdit(task) || task.status === status}
									onClick={() => onStatusChange(task, status)}
								>
									{StatusIcons[status]}
									<span className="ml-2">{TaskStatusLabels[status]}</span>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Project & Task Type */}
				<div className="flex items-center gap-2 flex-wrap">
					{task.project && (
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							<Folder className="h-3 w-3" />
							<span className="truncate max-w-[120px]">{task.project.title}</span>
						</div>
					)}
					<Badge
						variant="outline"
						className={cn("text-[10px] h-5", task.type === TaskType.WEEKLY && "border-cyan-300 text-cyan-700 bg-cyan-50", task.type === TaskType.SUBTASK && "border-slate-300 text-slate-600 bg-slate-50")}
					>
						{TaskTypeLabels[task.type]}
					</Badge>
				</div>

				{/* Meta Row */}
				<div className="flex items-center gap-3 text-xs">
					{task.dueDate && (
						<div className={cn("flex items-center gap-1", isOverdue && "text-red-600 font-medium", isDueToday && "text-amber-600", isDueTomorrow && "text-blue-600", !isOverdue && !isDueToday && !isDueTomorrow && "text-muted-foreground")}>
							<Calendar className="h-3 w-3" />
							<span>{format(new Date(task.dueDate), "MMM d")}</span>
						</div>
					)}
					<div className="flex items-center gap-1 text-muted-foreground">
						<Clock className="h-3 w-3" />
						<span>{Math.floor(task.totalTimeSpent / 60)}h</span>
					</div>
				</div>

				{/* Tags */}
				{task.tags && task.tags.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{task.tags.slice(0, 2).map((tag) => (
							<span
								key={tag.tagId}
								className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
								style={{ backgroundColor: tag.color + "20", color: tag.color }}
							>
								{tag.name}
							</span>
						))}
						{task.tags.length > 2 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">+{task.tags.length - 2}</span>}
					</div>
				)}

				{/* Footer with Timer Button */}
				<div className="flex items-center justify-between pt-2 border-t">
					<div className="flex items-center gap-2">
						{myAssignment ? (
							<Badge
								variant="secondary"
								className="text-[10px] h-5"
							>
								{getRoleLabel(myAssignment.role)}
								{myAssignment.isPrimary && " ★"}
							</Badge>
						) : (
							<span />
						)}
					</div>
					<div className="flex items-center gap-2">
						{/* Timer Button */}
						{task.status !== TaskStatus.COMPLETED && task.canStartTimer && (
							<Tooltip>
								<TooltipTrigger asChild>
									{isTimerRunningOnThis ? (
										<Button
											size="sm"
											variant="destructive"
											className="h-6 w-6 p-0"
											onClick={(e) => {
												e.stopPropagation();
												onStopTimer(task.taskId);
											}}
											disabled={isTimerLoading}
										>
											{isTimerLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Square className="h-3 w-3" />}
										</Button>
									) : (
										<Button
											size="sm"
											variant="ghost"
											className="h-6 w-6 p-0"
											onClick={(e) => {
												e.stopPropagation();
												onStartTimer(task);
											}}
											disabled={isTimerLoading || isTimerRunningOnOther}
										>
											{isTimerLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
										</Button>
									)}
								</TooltipTrigger>
								<TooltipContent>{isTimerRunningOnThis ? "Stop Timer" : isTimerRunningOnOther ? "Pause or stop one timer first" : "Start Timer"}</TooltipContent>
							</Tooltip>
						)}
						{/* Priority Indicator */}
						<Tooltip>
							<TooltipTrigger>
								<div className={cn("h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900", PriorityColors[task.priority])} />
							</TooltipTrigger>
							<TooltipContent>{TaskPriorityLabels[task.priority]} Priority</TooltipContent>
						</Tooltip>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// Overlay for dragging
export function TaskCardOverlay({ task }: { task: Task }) {
	return (
		<Card className={cn("w-80 cursor-grabbing shadow-xl border-l-4 rotate-3", PriorityBorderColors[task.priority])}>
			<CardContent className="p-3">
				<h4 className="font-medium text-sm">{task.title}</h4>
				{task.project && (
					<div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
						<Folder className="h-3 w-3" />
						<span>{task.project.title}</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
