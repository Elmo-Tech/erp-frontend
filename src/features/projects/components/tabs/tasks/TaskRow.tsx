/**
 * Task Row Component
 * Single row in the tasks table with expandable children
 */

"use client";

import { Button } from "@/components/ui/button";
import { TaskTypeBadge, TaskCategoryBadge } from "@/components/shared/StatusBadge";
import { useTaskChildren } from "@/features/dashboard/hooks/useTaskTree";
import { Task, TaskStatus, TaskStatusLabels, TaskType, TaskPriorityLabels, TaskChildrenResponse } from "@/features/dashboard/types/task";
import { MoreHorizontal, Pencil, Trash2, ChevronRight, ChevronDown, Calendar, CalendarClock, AlertCircle, Clock, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PriorityIndicator } from "./constants";
import { StatusIcon } from "./StatusIcon";
import { MarkCompleteButton } from "@/features/dashboard/components/MarkCompleteButton";

export interface TaskRowProps {
	task: Task;
	level: number;
	isExpanded: boolean;
	onToggle: () => void;
	onSelect: (task: Task) => void;
	onEdit?: (task: Task) => void;
	onDelete?: (task: Task) => void;
	onCreateChild?: (task: Task, type: TaskType) => void;
	canCreateWeeklyTasks?: boolean;
	canCreateSubtasks?: boolean;
	canEditMainTasks?: boolean;
	canEditWeeklyTasks?: boolean;
	canEditSubtasks?: boolean;
	expandedTasks: Set<number>;
	onToggleExpand: (taskId: number) => void;
	currentUserId?: number;
	showMyTasksOnly?: boolean;
	isAdminOrSuperAdmin?: boolean;
}

export function TaskRow({
	task,
	level,
	isExpanded,
	onToggle,
	onSelect,
	onEdit,
	onDelete,
	onCreateChild,
	canCreateWeeklyTasks,
	canCreateSubtasks,
	canEditMainTasks,
	canEditWeeklyTasks,
	canEditSubtasks,
	expandedTasks,
	onToggleExpand,
	currentUserId,
	showMyTasksOnly,
	isAdminOrSuperAdmin,
}: TaskRowProps) {
	const { data: childrenData, isLoading: loadingChildren } = useTaskChildren(task.taskId, isExpanded) as {
		data: TaskChildrenResponse | undefined;
		isLoading: boolean;
	};

	const loadedChildren = childrenData?.children || [];
	const hasChildren = (task.children && task.children.length > 0) || loadedChildren.length > 0;
	let childTasks = Array.from(
		new Map((loadedChildren.length > 0 ? loadedChildren : task.children || []).map((child) => [child.taskId, child])).values()
	);

	// Filter child tasks based on user assignment if needed
	if (showMyTasksOnly && !isAdminOrSuperAdmin && currentUserId) {
		childTasks = childTasks.filter((child) => child.assignees?.some((assignee) => assignee.userId === currentUserId));
	}

	const canExpand = hasChildren || task.type !== TaskType.SUBTASK;
	const timeSpentHours = Math.floor(task.totalTimeSpent / 60);
	const timeSpentMins = task.totalTimeSpent % 60;
	const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== TaskStatus.COMPLETED;
	const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

	// Determine if user can edit this specific task based on its type
	const canEditThisTask = onEdit && ((task.type === TaskType.MAIN && canEditMainTasks) || (task.type === TaskType.WEEKLY && canEditWeeklyTasks) || (task.type === TaskType.SUBTASK && canEditSubtasks));

	return (
		<>
			<div className={cn("grid grid-cols-[minmax(0,1fr)_120px_140px_160px_100px_100px] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors group", task.status === TaskStatus.COMPLETED && "opacity-60")}>
				{/* Task Info */}
				<div
					className="flex items-center gap-3 min-w-0"
					style={{ paddingLeft: `${level * 24}px` }}
				>
					{/* Expand Button */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							if (canExpand) onToggle();
						}}
						className={cn("shrink-0 p-1 rounded hover:bg-muted transition-colors", !canExpand && "invisible")}
					>
						{loadingChildren ? (
							<div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
						) : isExpanded ? (
							<ChevronDown className="h-4 w-4 text-muted-foreground" />
						) : (
							<ChevronRight className="h-4 w-4 text-muted-foreground" />
						)}
					</button>

					{/* Priority Indicator */}
					<Tooltip>
						<TooltipTrigger>
							<div className={cn("w-1 h-8 rounded-full shrink-0", PriorityIndicator[task.priority])} />
						</TooltipTrigger>
						<TooltipContent side="top">{TaskPriorityLabels[task.priority]} Priority</TooltipContent>
					</Tooltip>

					{/* Status Icon */}
					<Tooltip>
						<TooltipTrigger>{StatusIcon[task.status]}</TooltipTrigger>
						<TooltipContent side="top">{TaskStatusLabels[task.status]}</TooltipContent>
					</Tooltip>

					{/* Task Title & Type */}
					<div
						className="min-w-0 flex-1 cursor-pointer"
						onClick={() => onSelect(task)}
					>
						<div className="flex items-center gap-2">
							<span className={cn("font-medium truncate", task.status === TaskStatus.COMPLETED && "line-through")}>{task.title}</span>
							{task.type !== TaskType.MAIN && (
								<TaskTypeBadge
									type={task.type}
									size="sm"
									className="text-[10px] px-1.5 py-0 shrink-0"
								/>
							)}
							{task.taskCategory && (
								<TaskCategoryBadge
									category={task.taskCategory}
									size="sm"
									className="text-[10px] px-1.5 py-0 shrink-0"
								/>
							)}
						</div>
						{task.tags && task.tags.length > 0 && (
							<div className="flex gap-1 mt-1">
								{task.tags.slice(0, 3).map((tag) => (
									<span
										key={tag.tagId}
										className="text-[10px] px-1.5 py-0.5 rounded-full"
										style={{ backgroundColor: tag.color + "15", color: tag.color }}
									>
										{tag.name}
									</span>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Assignees */}
				<div className="flex -space-x-2">
					{task.assignees && task.assignees.length > 0 ? (
						<>
							{task.assignees.slice(0, 3).map((assignee) => (
								<Tooltip key={assignee.assigneeId}>
									<TooltipTrigger>
										<Avatar className="h-7 w-7 border-2 border-background">
											<AvatarImage src={assignee.user?.avatar} />
											<AvatarFallback className="text-[10px] bg-primary/10">{assignee.user?.name?.slice(0, 2).toUpperCase() || "?"}</AvatarFallback>
										</Avatar>
									</TooltipTrigger>
									<TooltipContent>{assignee.user?.name || "Unknown"}</TooltipContent>
								</Tooltip>
							))}
							{task.assignees.length > 3 && <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium">+{task.assignees.length - 3}</div>}
						</>
					) : (
						<span className="text-xs text-muted-foreground">—</span>
					)}
				</div>

				{/* Due Date */}
				<div className={cn("text-sm", isOverdue && "text-red-600 font-medium", isDueToday && "text-amber-600 font-medium")}>
					{task.dueDate ? (
						<div className="flex items-center gap-1.5">
							<Calendar className="h-3.5 w-3.5" />
							<span>{format(new Date(task.dueDate), "MMM d")}</span>
							{isOverdue && <AlertCircle className="h-3.5 w-3.5" />}
						</div>
					) : (
						<span className="text-muted-foreground">—</span>
					)}
				</div>

				{/* Expected Resolution */}
				<div className="text-sm">
					{task.expectedResolutionDate ? (
						<div className="flex items-center gap-1.5">
							<CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
							<span>{format(new Date(task.expectedResolutionDate), "MMM d")}</span>
						</div>
					) : (
						<span className="text-muted-foreground">—</span>
					)}
				</div>

				{/* Time */}
				<div className="text-sm text-muted-foreground">
					<div className="flex items-center gap-1.5">
						<Clock className="h-3.5 w-3.5" />
						<span>
							{timeSpentHours}h {timeSpentMins > 0 && `${timeSpentMins}m`}
						</span>
					</div>
					{task.estimatedHours > 0 && <div className="text-[10px] text-muted-foreground/70">of {task.estimatedHours}h</div>}
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
					<MarkCompleteButton task={task} />
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
							>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-48"
						>
							{canEditThisTask && (
								<DropdownMenuItem onClick={() => onEdit(task)}>
									<Pencil className="h-4 w-4 me-2" /> Edit Task
								</DropdownMenuItem>
							)}
							{onCreateChild && canCreateWeeklyTasks && task.type === TaskType.MAIN && task.status !== TaskStatus.COMPLETED && (
								<DropdownMenuItem onClick={() => onCreateChild(task, TaskType.WEEKLY)}>
									<Plus className="h-4 w-4 me-2" /> Add Weekly Task
								</DropdownMenuItem>
							)}
							{onCreateChild && canCreateSubtasks && task.type === TaskType.WEEKLY && task.status !== TaskStatus.COMPLETED && (
								<DropdownMenuItem onClick={() => onCreateChild(task, TaskType.SUBTASK)}>
									<Plus className="h-4 w-4 me-2" /> Add Subtask
								</DropdownMenuItem>
							)}
							{onDelete && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => onDelete(task)}
										className="text-destructive focus:text-destructive"
									>
										<Trash2 className="h-4 w-4 me-2" /> Delete
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Children */}
			{isExpanded && childTasks.length > 0 && (
				<>
					{childTasks.map((child) => (
						<TaskRow
							key={child.taskId}
							task={child}
							level={level + 1}
							isExpanded={expandedTasks.has(child.taskId)}
							onToggle={() => onToggleExpand(child.taskId)}
							onSelect={onSelect}
							onEdit={onEdit}
							onDelete={onDelete}
							onCreateChild={onCreateChild}
							canCreateWeeklyTasks={canCreateWeeklyTasks}
							canCreateSubtasks={canCreateSubtasks}
							canEditMainTasks={canEditMainTasks}
							canEditWeeklyTasks={canEditWeeklyTasks}
							canEditSubtasks={canEditSubtasks}
							expandedTasks={expandedTasks}
							onToggleExpand={onToggleExpand}
							currentUserId={currentUserId}
							showMyTasksOnly={showMyTasksOnly}
							isAdminOrSuperAdmin={isAdminOrSuperAdmin}
						/>
					))}
				</>
			)}
		</>
	);
}
