/**
 * List View Component
 * Table/list view for tasks with expandable subtasks (hierarchical display)
 */

import { useMyTaskAccess } from "./useMyTaskAccess";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format, isPast } from "date-fns";
import { ChevronRight, ChevronDown, Play, Square, MoreVertical, Eye, GitBranch, Calendar, Clock, CheckCircle2, Loader2, Timer } from "lucide-react";
import { Task, TaskStatus, TaskStatusLabels, TaskType, TaskTypeLabels } from "../../types/task";
import { PriorityColors, StatusColors } from "./constants";
import { StatusIcons } from "./StatusIcons";
import { useStartTimer, useStopTimer } from "@/features/sales/hooks";
import { TrackableType } from "@/features/sales/types";
import { useTimerStore } from "@/store/timerStore";
import { toast } from "sonner";
import { getRoleLabel } from "@/config/simplification";

import React, { useEffect } from "react";

interface ListViewProps {
	tasks: Task[];
	expandedTasks: Set<number>;
	currentUserId?: number;
	highlightedTaskId?: number | null;
	onToggleExpand: (id: number) => void;
	onStatusChange: (task: Task, status: TaskStatus) => void;
	onViewTask: (task: Task) => void;
}

export function ListView({ tasks, expandedTasks, currentUserId, highlightedTaskId, onToggleExpand, onStatusChange, onViewTask }: ListViewProps) {
	const { activeTimer } = useTimerStore();
	const startTimer = useStartTimer();
	const stopTimer = useStopTimer();

	// Check if active timer is for a task using global store (real-time)
	const activeTaskId = activeTimer ? Number(activeTimer.trackableId) : null;
	const isTaskTimer = activeTimer?.trackableType?.toLowerCase().includes("task");

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
		// Prevent starting if another timer is running
		if (activeTimer) {
			toast.error("Please stop the current timer first");
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

	const handleStopTimer = async () => {
		try {
			await stopTimer.mutateAsync();
			toast.success("Timer stopped");
		} catch {
			toast.error("Failed to stop timer");
		}
	};

	return (
		<Card>
			<CardContent className="p-0">
				<div className="divide-y">
					{tasks.map((task) => (
						<ListItem
							key={task.taskId}
							task={task}
							isExpanded={expandedTasks.has(task.taskId)}
							onToggle={() => onToggleExpand(task.taskId)}
							currentUserId={currentUserId}
							isHighlighted={highlightedTaskId === task.taskId}
							onStatusChange={onStatusChange}
							onViewTask={onViewTask}
							expandedTasks={expandedTasks}
							onToggleExpand={onToggleExpand}
							activeTaskId={isTaskTimer ? activeTaskId : null}
							onStartTimer={handleStartTimer}
							onStopTimer={handleStopTimer}
							isTimerLoading={startTimer.isPending || stopTimer.isPending}
							hasActiveTimer={!!activeTimer}
							highlightedTaskId={highlightedTaskId}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

interface ListItemProps {
	task: Task;
	isExpanded: boolean;
	onToggle: () => void;
	currentUserId?: number;
	isHighlighted?: boolean;
	highlightedTaskId?: number | null;
	onStatusChange: (task: Task, status: TaskStatus) => void;
	onViewTask: (task: Task) => void;
	expandedTasks: Set<number>;
	onToggleExpand: (id: number) => void;
	level?: number;
	activeTaskId: number | null;
	onStartTimer: (task: Task) => void;
	onStopTimer: () => void;
	isTimerLoading: boolean;
	hasActiveTimer: boolean;
}

function ListItem({
	task,
	isExpanded,
	onToggle,
	currentUserId,
	isHighlighted,
	highlightedTaskId,
	onStatusChange,
	onViewTask,
	expandedTasks,
	onToggleExpand,
	level = 0,
	activeTaskId,
	onStartTimer,
	onStopTimer,
	isTimerLoading,
	hasActiveTimer,
}: ListItemProps) {
	const access = useMyTaskAccess();
	const hasChildren = task.hasChildren || (task.children && task.children.length > 0);
	const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== TaskStatus.COMPLETED;
	const myAssignment = task.assignees?.find((a) => a.userId === currentUserId);
	const isTimerRunningOnThis = activeTaskId === task.taskId;
	const isTimerRunningOnOther = hasActiveTimer && !isTimerRunningOnThis;

	return (
		<>
			<div
				id={`task-${task.taskId}`}
				className={cn(
					"flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors group",
					task.status === TaskStatus.COMPLETED && "opacity-60",
					level > 0 && "bg-muted/30",
					isTimerRunningOnThis && "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500",
					isHighlighted && "ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 animate-pulse"
				)}
				style={{ paddingLeft: `${16 + level * 24}px` }}
			>
				{/* Expand Button */}
				<button
					onClick={onToggle}
					className={cn("p-1 rounded hover:bg-muted shrink-0", !hasChildren && "invisible")}
				>
					{isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
				</button>

				{/* Priority Indicator */}
				<div className={cn("w-1 h-10 rounded-full shrink-0", PriorityColors[task.priority])} />

				{/* Active Timer Indicator */}
				{isTimerRunningOnThis && (
					<div className="flex items-center gap-1 shrink-0">
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
						<Timer className="h-4 w-4 text-green-600" />
					</div>
				)}

				{/* Status Dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button aria-label={`Change status for ${task.title}`} disabled={!access.canEdit(task)} className="shrink-0 hover:scale-110 transition-transform">{StatusIcons[task.status]}</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						<div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Change Status</div>
						{Object.values(TaskStatus).map((status) => (
							<DropdownMenuItem
								key={status}
								disabled={!access.canEdit(task) || task.status === status}
								onClick={() => onStatusChange(task, status)}
							>
								{StatusIcons[status]}
								<span className="ml-2">{TaskStatusLabels[status]}</span>
								{task.status === status && <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Title & Project */}
				<div
					className="flex-1 min-w-0 cursor-pointer"
					onClick={() => onViewTask(task)}
				>
					<div className="flex items-center gap-2">
						<h4 className={cn("font-medium truncate", task.status === TaskStatus.COMPLETED && "line-through")}>{task.title}</h4>
						{/* Task Type Badge */}
						<Badge
							variant="outline"
							className={cn(
								"text-[10px] h-5 shrink-0",
								task.type === TaskType.MAIN && "border-indigo-300 text-indigo-700 bg-indigo-50",
								task.type === TaskType.WEEKLY && "border-cyan-300 text-cyan-700 bg-cyan-50",
								task.type === TaskType.SUBTASK && "border-slate-300 text-slate-600 bg-slate-50"
							)}
						>
							{TaskTypeLabels[task.type]}
						</Badge>
						{hasChildren && (
							<Badge
								variant="outline"
								className="text-[10px] h-5 shrink-0"
							>
								<GitBranch className="h-3 w-3 mr-1" />
								{task.children?.length || "+"}
							</Badge>
						)}
					</div>
					{task.project && <p className="text-sm text-muted-foreground truncate">{task.project.title}</p>}
				</div>

				{/* Status Badge */}
				<Badge className={cn("hidden sm:flex text-xs shrink-0", StatusColors[task.status])}>{TaskStatusLabels[task.status]}</Badge>

				{/* Tags */}
				<div className="hidden lg:flex items-center gap-1 shrink-0">
					{task.tags?.slice(0, 2).map((tag) => (
						<span
							key={tag.tagId}
							className="text-xs px-2 py-0.5 rounded-full"
							style={{ backgroundColor: tag.color + "20", color: tag.color }}
						>
							{tag.name}
						</span>
					))}
				</div>

				{/* Role */}
				{myAssignment && (
					<Badge
						variant="outline"
						className="hidden md:flex text-xs shrink-0"
					>
						{getRoleLabel(myAssignment.role)}
					</Badge>
				)}

				{/* Due Date */}
				{task.dueDate && (
					<div className={cn("flex items-center gap-1 text-sm shrink-0", isOverdue ? "text-red-600 font-medium" : "text-muted-foreground")}>
						<Calendar className="h-4 w-4" />
						<span className="hidden sm:inline">{format(new Date(task.dueDate), "MMM d")}</span>
					</div>
				)}

				{/* Time */}
				<div className="flex items-center gap-1 text-sm text-muted-foreground w-14 shrink-0">
					<Clock className="h-4 w-4" />
					<span>{Math.floor(task.totalTimeSpent / 60)}h</span>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-1 shrink-0">
					{task.status !== TaskStatus.COMPLETED && task.canStartTimer && (
						<Tooltip>
							<TooltipTrigger asChild>
								{isTimerRunningOnThis ? (
									<Button
										size="sm"
										variant="destructive"
										className="h-8 w-8 p-0"
										onClick={() => onStopTimer()}
										disabled={isTimerLoading}
									>
										{isTimerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
									</Button>
								) : (
									<Button
										size="sm"
										variant="ghost"
										className="h-8 w-8 p-0"
										onClick={() => onStartTimer(task)}
										disabled={isTimerLoading || isTimerRunningOnOther}
									>
										{isTimerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
									</Button>
								)}
							</TooltipTrigger>
							<TooltipContent>{isTimerRunningOnThis ? "Stop Timer" : isTimerRunningOnOther ? "Stop other timer first" : "Start Timer"}</TooltipContent>
						</Tooltip>
					)}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => onViewTask(task)}>
								<Eye className="h-4 w-4 mr-2" />
								View Details
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Children - Render recursively */}
			{isExpanded && hasChildren && task.children && (
				<div>
					{task.children.map((child) => (
						<ListItem
							key={child.taskId}
							task={child}
							isExpanded={expandedTasks.has(child.taskId)}
							onToggle={() => onToggleExpand(child.taskId)}
							currentUserId={currentUserId}
							isHighlighted={highlightedTaskId === child.taskId}
							highlightedTaskId={highlightedTaskId}
							onStatusChange={onStatusChange}
							onViewTask={onViewTask}
							expandedTasks={expandedTasks}
							onToggleExpand={onToggleExpand}
							level={level + 1}
							activeTaskId={activeTaskId}
							onStartTimer={onStartTimer}
							onStopTimer={onStopTimer}
							isTimerLoading={isTimerLoading}
							hasActiveTimer={hasActiveTimer}
						/>
					))}
				</div>
			)}
		</>
	);
}
