/**
 * Kanban View Component
 * Drag and drop kanban board for tasks
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { MoreVertical, Eye, GitBranch, Folder, Calendar, Clock } from "lucide-react";
import { Task, TaskStatus, TaskStatusLabels, TaskPriority, TaskPriorityLabels } from "../../types/task";
import { KanbanColumns, PriorityColors, PriorityBorderColors } from "./constants";
import { StatusIcons } from "./StatusIcons";

interface KanbanViewProps {
	tasksByStatus: Record<TaskStatus, Task[]>;
	currentUserId?: number;
	onStatusChange: (task: Task, status: TaskStatus) => void;
	onViewTask: (task: Task) => void;
}

export function KanbanView({ tasksByStatus, currentUserId, onStatusChange, onViewTask }: KanbanViewProps) {
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
										onStatusChange={onStatusChange}
										onViewTask={onViewTask}
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
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.taskId });

	const style = {
		transform: CSS.Translate.toString(transform),
		opacity: isDragging ? 0.5 : 1,
	};

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
function KanbanCard({ task, currentUserId, onStatusChange, onViewTask }: { task: Task; currentUserId?: number; onStatusChange: (task: Task, status: TaskStatus) => void; onViewTask: (task: Task) => void }) {
	const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== TaskStatus.COMPLETED;
	const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
	const isDueTomorrow = task.dueDate && isTomorrow(new Date(task.dueDate));
	const myAssignment = task.assignees?.find((a) => a.userId === currentUserId);
	const hasSubtasks = task.hasChildren || (task.children && task.children.length > 0);

	return (
		<Card className={cn("cursor-grab active:cursor-grabbing transition-all hover:shadow-md border-l-4 group", PriorityBorderColors[task.priority], task.status === TaskStatus.COMPLETED && "opacity-60")}>
			<CardContent className="p-3 space-y-2">
				{/* Header with menu */}
				<div className="flex items-start justify-between gap-2">
					<h4 className={cn("font-medium text-sm line-clamp-2 flex-1", task.status === TaskStatus.COMPLETED && "line-through")}>{task.title}</h4>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
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
							{hasSubtasks && (
								<DropdownMenuItem onClick={() => onViewTask(task)}>
									<GitBranch className="h-4 w-4 mr-2" />
									View Subtasks ({task.children?.length || 0})
								</DropdownMenuItem>
							)}
							<DropdownMenuSeparator />
							<div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Move to</div>
							{Object.values(TaskStatus).map((status) => (
								<DropdownMenuItem
									key={status}
									disabled={task.status === status}
									onClick={() => onStatusChange(task, status)}
								>
									{StatusIcons[status]}
									<span className="ml-2">{TaskStatusLabels[status]}</span>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Project & Subtasks indicator */}
				<div className="flex items-center gap-2 flex-wrap">
					{task.project && (
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							<Folder className="h-3 w-3" />
							<span className="truncate max-w-[120px]">{task.project.title}</span>
						</div>
					)}
					{hasSubtasks && (
						<Badge
							variant="outline"
							className="text-[10px] h-5 gap-1"
						>
							<GitBranch className="h-3 w-3" />
							{task.children?.length || "+"} subtasks
						</Badge>
					)}
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

				{/* Footer */}
				<div className="flex items-center justify-between pt-2 border-t">
					{myAssignment ? (
						<Badge
							variant="secondary"
							className="text-[10px] h-5"
						>
							{myAssignment.role}
							{myAssignment.isPrimary && " ★"}
						</Badge>
					) : (
						<span />
					)}
					<Tooltip>
						<TooltipTrigger>
							<div className={cn("h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900", PriorityColors[task.priority])} />
						</TooltipTrigger>
						<TooltipContent>{TaskPriorityLabels[task.priority]} Priority</TooltipContent>
					</Tooltip>
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
