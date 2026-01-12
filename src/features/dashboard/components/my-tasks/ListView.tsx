/**
 * List View Component
 * Table/list view for tasks with expandable subtasks
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format, isPast } from "date-fns";
import { ChevronRight, ChevronDown, Play, MoreVertical, Eye, Edit, GitBranch, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Task, TaskStatus, TaskStatusLabels } from "../../types/task";
import { PriorityColors, StatusColors } from "./constants";
import { StatusIcons } from "./StatusIcons";

interface ListViewProps {
	tasks: Task[];
	expandedTasks: Set<number>;
	currentUserId?: number;
	onToggleExpand: (id: number) => void;
	onStatusChange: (task: Task, status: TaskStatus) => void;
	onViewTask: (task: Task) => void;
}

export function ListView({ tasks, expandedTasks, currentUserId, onToggleExpand, onStatusChange, onViewTask }: ListViewProps) {
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
							onStatusChange={onStatusChange}
							onViewTask={onViewTask}
							expandedTasks={expandedTasks}
							onToggleExpand={onToggleExpand}
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
	onStatusChange: (task: Task, status: TaskStatus) => void;
	onViewTask: (task: Task) => void;
	expandedTasks: Set<number>;
	onToggleExpand: (id: number) => void;
	level?: number;
}

function ListItem({ task, isExpanded, onToggle, currentUserId, onStatusChange, onViewTask, expandedTasks, onToggleExpand, level = 0 }: ListItemProps) {
	const hasChildren = task.hasChildren || (task.children && task.children.length > 0);
	const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== TaskStatus.COMPLETED;
	const myAssignment = task.assignees?.find((a) => a.userId === currentUserId);

	return (
		<>
			<div
				className={cn("flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors group", task.status === TaskStatus.COMPLETED && "opacity-60", level > 0 && "bg-muted/30")}
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

				{/* Status Dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button className="shrink-0 hover:scale-110 transition-transform">{StatusIcons[task.status]}</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						<div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Change Status</div>
						{Object.values(TaskStatus).map((status) => (
							<DropdownMenuItem
								key={status}
								disabled={task.status === status}
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
						{myAssignment.role}
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
								<Button
									size="sm"
									variant="ghost"
									className="h-8 w-8 p-0"
								>
									<Play className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Start Timer</TooltipContent>
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
							<DropdownMenuItem>
								<Edit className="h-4 w-4 mr-2" />
								Edit Task
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Children */}
			{isExpanded && hasChildren && task.children && (
				<div>
					{task.children.map((child) => (
						<ListItem
							key={child.taskId}
							task={child}
							isExpanded={expandedTasks.has(child.taskId)}
							onToggle={() => onToggleExpand(child.taskId)}
							currentUserId={currentUserId}
							onStatusChange={onStatusChange}
							onViewTask={onViewTask}
							expandedTasks={expandedTasks}
							onToggleExpand={onToggleExpand}
							level={level + 1}
						/>
					))}
				</div>
			)}
		</>
	);
}
