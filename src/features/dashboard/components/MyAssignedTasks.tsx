"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMyAssignedTasks } from "../hooks/useTasks";
import { useTaskChildren } from "../hooks/useTaskTree";
import { useAuthStore } from "@/store/authStore";
import { TaskFilters, Task, TaskStatus, TaskType, TaskPriority, TaskStatusLabels, TaskTypeLabels, TaskTypeColors, TaskPriorityLabels, TaskChildrenResponse } from "../types/task";
import { Search, Clock, User, Calendar, CheckCircle2, ChevronRight, ChevronDown, AlertCircle, Circle, Timer, Play } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { MarkCompleteButton } from "./MarkCompleteButton";
import { getRoleLabel } from "@/config/simplification";
import { dedupeTaskTree } from "../utils/taskTree";

// Priority indicator colors
const PriorityIndicator: Record<TaskPriority, string> = {
	[TaskPriority.URGENT]: "bg-red-500",
	[TaskPriority.HIGH]: "bg-orange-500",
	[TaskPriority.MEDIUM]: "bg-yellow-500",
	[TaskPriority.LOW]: "bg-blue-500",
};

// Status icons
const StatusIcon: Record<TaskStatus, React.ReactNode> = {
	[TaskStatus.TODO]: <Circle className="h-4 w-4 text-slate-400" />,
	[TaskStatus.IN_PROGRESS]: <Timer className="h-4 w-4 text-blue-500 animate-pulse" />,
	[TaskStatus.REVIEW]: <AlertCircle className="h-4 w-4 text-amber-500" />,
	[TaskStatus.TESTING]: <CheckCircle2 className="h-4 w-4 text-purple-500" />,
	[TaskStatus.COMPLETED]: <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

export function MyAssignedTasks() {
	const { user } = useAuthStore();
	const [filters, setFilters] = useState<TaskFilters>({
		page: 1,
		perPage: 50, // Increase to show more tasks in nested view
	});
	const [searchTerm, setSearchTerm] = useState("");
	const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());

	const { data: tasksData, isLoading, error } = useMyAssignedTasks(filters);

	const toggleExpand = useCallback((taskId: number) => {
		setExpandedTasks((prev) => {
			const next = new Set(prev);
			if (next.has(taskId)) next.delete(taskId);
			else next.add(taskId);
			return next;
		});
	}, []);

	const handleSearch = (value: string) => {
		setSearchTerm(value);
		setFilters((prev) => ({
			...prev,
			search: value || undefined,
			page: 1,
		}));
	};

	const handleStatusFilter = (status: string) => {
		setFilters((prev) => ({
			...prev,
			status: status === "all" ? undefined : (status as TaskStatus),
			page: 1,
		}));
	};

	const handleTypeFilter = (type: string) => {
		setFilters((prev) => ({
			...prev,
			type: type === "all" ? undefined : (type as TaskType),
			page: 1,
		}));
	};

	const handlePriorityFilter = (priority: string) => {
		setFilters((prev) => ({
			...prev,
			priority: priority === "all" ? undefined : (priority as TaskPriority),
			page: 1,
		}));
	};

	// Filter tasks (backend already returns only top-level tasks)
	const filteredTasks = dedupeTaskTree(
		tasksData?.tasks?.filter((task) => {
			// Search filter
			if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
			// Status filter
			if (filters.status && task.status !== filters.status) return false;
			// Type filter
			if (filters.type && task.type !== filters.type) return false;
			// Priority filter
			if (filters.priority && task.priority !== filters.priority) return false;
			return true;
		}) || []
	);

	// Calculate stats recursively to count all tasks including children
	const calculateStatsRecursively = (tasks: Task[]): { total: number; done: number; inProgress: number; review: number } => {
		let total = 0;
		let done = 0;
		let inProgress = 0;
		let review = 0;

		tasks.forEach((task) => {
			total++;
			if (task.status === TaskStatus.COMPLETED) done++;
			if (task.status === TaskStatus.IN_PROGRESS) inProgress++;
			if (task.status === TaskStatus.REVIEW) review++;

			// Count children recursively
			if (task.children && task.children.length > 0) {
				const childStats = calculateStatsRecursively(task.children);
				total += childStats.total;
				done += childStats.done;
				inProgress += childStats.inProgress;
				review += childStats.review;
			}
		});

		return { total, done, inProgress, review };
	};

	const stats = calculateStatsRecursively(filteredTasks);

	return (
		<TooltipProvider>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<User className="h-5 w-5" />
							My Assigned Tasks
						</div>
						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							<span>{stats.total} total</span>
							<span className="text-green-600">{stats.done} done</span>
							<span className="text-blue-600">{stats.inProgress} in progress</span>
							{stats.review > 0 && <span className="text-amber-600">{stats.review} in review</span>}
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{/* Filters */}
					<div className="space-y-4 mb-6">
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="flex-1">
								<div className="relative">
									<Search className="absolute start-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search tasks..."
										value={searchTerm}
										onChange={(e) => handleSearch(e.target.value)}
										className="pl-10"
									/>
								</div>
							</div>
							<div className="flex gap-2">
								<Select onValueChange={handleStatusFilter}>
									<SelectTrigger className="w-32">
										<SelectValue placeholder="Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Status</SelectItem>
										<SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
										<SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
										<SelectItem value={TaskStatus.REVIEW}>Review</SelectItem>
										<SelectItem value={TaskStatus.TESTING}>Testing</SelectItem>
										<SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
									</SelectContent>
								</Select>

								<Select onValueChange={handleTypeFilter}>
									<SelectTrigger className="w-32">
										<SelectValue placeholder="Type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Types</SelectItem>
										<SelectItem value={TaskType.MAIN}>Main Task</SelectItem>
										<SelectItem value={TaskType.WEEKLY}>Weekly Task</SelectItem>
										<SelectItem value={TaskType.SUBTASK}>Subtask</SelectItem>
									</SelectContent>
								</Select>

								<Select onValueChange={handlePriorityFilter}>
									<SelectTrigger className="w-32">
										<SelectValue placeholder="Priority" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Priority</SelectItem>
										<SelectItem value={TaskPriority.LOW}>Low</SelectItem>
										<SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
										<SelectItem value={TaskPriority.HIGH}>High</SelectItem>
										<SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					{/* Tasks List - Card-based Design */}
					{isLoading ? (
						<TaskListSkeleton />
					) : error ? (
						<div className="text-center py-16 text-destructive">
							<AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
							<p>Failed to load assigned tasks: {error.message}</p>
						</div>
					) : filteredTasks.length === 0 ? (
						<EmptyState />
					) : (
						<div className="space-y-3">
							{filteredTasks.map((task) => (
								<TaskCard
									key={task.taskId}
									task={task}
									level={0}
									isExpanded={expandedTasks.has(task.taskId)}
									onToggle={() => toggleExpand(task.taskId)}
									expandedTasks={expandedTasks}
									onToggleExpand={toggleExpand}
									currentUserId={user?.userId}
								/>
							))}
						</div>
					)}

					{/* Pagination */}
					{tasksData?.pagination && tasksData.pagination.totalPages > 1 && (
						<div className="flex items-center justify-center gap-2 mt-6">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
								disabled={(filters.page || 1) === 1}
							>
								Previous
							</Button>
							<span className="text-sm text-muted-foreground px-4">
								Page {filters.page || 1} of {tasksData.pagination.totalPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(tasksData.pagination.totalPages, (prev.page || 1) + 1) }))}
								disabled={(filters.page || 1) === tasksData.pagination.totalPages}
							>
								Next
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</TooltipProvider>
	);
}

// Task Card Component - Modern Card-based Design
interface TaskCardProps {
	task: Task;
	level: number;
	isExpanded: boolean;
	onToggle: () => void;
	expandedTasks: Set<number>;
	onToggleExpand: (taskId: number) => void;
	currentUserId?: number;
}

function TaskCard({ task, level, isExpanded, onToggle, expandedTasks, onToggleExpand, currentUserId }: TaskCardProps) {
	const { data: childrenData, isLoading: loadingChildren } = useTaskChildren(task.taskId, isExpanded) as {
		data: TaskChildrenResponse | undefined;
		isLoading: boolean;
	};

	const loadedChildren = childrenData?.children || [];
	const hasChildren = (task.children && task.children.length > 0) || loadedChildren.length > 0;
	let childTasks = Array.from(
		new Map((loadedChildren.length > 0 ? loadedChildren : task.children || []).map((child) => [child.taskId, child])).values()
	);

	// Filter child tasks to show only those where user is assigned
	if (currentUserId) {
		childTasks = childTasks.filter((child) => child.assignees?.some((assignee) => assignee.userId === currentUserId));
	}

	const canExpand = hasChildren || task.type !== TaskType.SUBTASK;
	const timeSpentHours = Math.floor(task.totalTimeSpent / 60);
	const timeSpentMins = task.totalTimeSpent % 60;
	const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== TaskStatus.COMPLETED;
	const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
	const myAssignment = task.assignees?.find((a) => a.userId === currentUserId);

	return (
		<div
			className={cn("bg-card border rounded-lg transition-all duration-200 hover:shadow-md", task.status === TaskStatus.COMPLETED && "opacity-75", level > 0 && "ms-6")}
			style={{ marginLeft: level > 0 ? `${level * 24}px` : 0 }}
		>
			<div className="p-4">
				<div className="flex items-start gap-3">
					{/* Expand Button & Priority */}
					<div className="flex items-center gap-2 shrink-0">
						<button
							onClick={(e) => {
								e.stopPropagation();
								if (canExpand) onToggle();
							}}
							className={cn("p-1 rounded hover:bg-muted transition-colors", !canExpand && "invisible")}
						>
							{loadingChildren ? (
								<div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
							) : isExpanded ? (
								<ChevronDown className="h-4 w-4 text-muted-foreground" />
							) : (
								<ChevronRight className="h-4 w-4 text-muted-foreground" />
							)}
						</button>

						<Tooltip>
							<TooltipTrigger>
								<div className={cn("w-1 h-12 rounded-full", PriorityIndicator[task.priority])} />
							</TooltipTrigger>
							<TooltipContent>{TaskPriorityLabels[task.priority]} Priority</TooltipContent>
						</Tooltip>
					</div>

					{/* Main Content */}
					<div className="flex-1 min-w-0">
						{/* Header Row */}
						<div className="flex items-start justify-between gap-4 mb-2">
							<div className="flex items-center gap-2 min-w-0">
								<Tooltip>
									<TooltipTrigger>{StatusIcon[task.status]}</TooltipTrigger>
									<TooltipContent>{TaskStatusLabels[task.status]}</TooltipContent>
								</Tooltip>

								<h3 className={cn("font-medium truncate", task.status === TaskStatus.COMPLETED && "line-through")}>{task.title}</h3>

								{task.type !== TaskType.MAIN && (
									<Badge
										variant="outline"
										className={cn("text-xs shrink-0", TaskTypeColors[task.type])}
									>
										{TaskTypeLabels[task.type]}
									</Badge>
								)}
							</div>

							{/* Quick Actions */}
							<div className="flex items-center gap-2 shrink-0">
								{task.status !== TaskStatus.COMPLETED && (
									<>
										<Button
											size="sm"
											variant="outline"
											className="h-7 px-2 text-xs"
										>
											<Play className="h-3 w-3 me-1" />
											Start
										</Button>
										<MarkCompleteButton task={task} />
									</>
								)}
								{task.status === TaskStatus.COMPLETED && (
									<Badge
										variant="default"
										className="text-xs bg-green-100 text-green-800"
									>
										<CheckCircle2 className="h-3 w-3 me-1" />
										Done
									</Badge>
								)}
							</div>
						</div>

						{/* Details Row */}
						<div className="flex items-center gap-6 text-sm text-muted-foreground">
							{/* Project */}
							<div className="flex items-center gap-1">
								<div className="w-2 h-2 rounded-full bg-blue-500" />
								<span className="truncate max-w-32">{task.project?.title}</span>
							</div>

							{/* My Role */}
							{myAssignment && (
								<div className="flex items-center gap-1">
									<User className="h-3 w-3" />
									<span>{getRoleLabel(myAssignment.role)}</span>
									{myAssignment.isPrimary && (
										<Badge
											variant="secondary"
											className="text-[10px] px-1 py-0"
										>
											Primary
										</Badge>
									)}
								</div>
							)}

							{/* Time */}
							<div className="flex items-center gap-1">
								<Clock className="h-3 w-3" />
								<span>
									{timeSpentHours}h{timeSpentMins > 0 && ` ${timeSpentMins}m`}
									{task.estimatedHours > 0 && ` / ${task.estimatedHours}h`}
								</span>
							</div>

							{/* Due Date */}
							{task.dueDate && (
								<div className={cn("flex items-center gap-1", isOverdue && "text-red-600", isDueToday && "text-amber-600")}>
									<Calendar className="h-3 w-3" />
									<span>{format(new Date(task.dueDate), "MMM d")}</span>
									{isOverdue && <AlertCircle className="h-3 w-3" />}
								</div>
							)}
						</div>

						{/* Tags */}
						{task.tags && task.tags.length > 0 && (
							<div className="flex gap-1 mt-2">
								{task.tags.slice(0, 3).map((tag) => (
									<span
										key={tag.tagId}
										className="text-[10px] px-2 py-1 rounded-full"
										style={{ backgroundColor: tag.color + "15", color: tag.color }}
									>
										{tag.name}
									</span>
								))}
								{task.tags.length > 3 && <span className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground">+{task.tags.length - 3}</span>}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Children */}
			{isExpanded && childTasks.length > 0 && (
				<div className="border-t bg-muted/20">
					<div className="p-2 space-y-2">
						{childTasks.map((child) => (
							<TaskCard
								key={child.taskId}
								task={child}
								level={level + 1}
								isExpanded={expandedTasks.has(child.taskId)}
								onToggle={() => onToggleExpand(child.taskId)}
								expandedTasks={expandedTasks}
								onToggleExpand={onToggleExpand}
								currentUserId={currentUserId}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

// Empty State Component
function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-16 px-4">
			<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
				<User className="h-8 w-8 text-muted-foreground" />
			</div>
			<h3 className="text-lg font-semibold mb-1">No assigned tasks</h3>
			<p className="text-muted-foreground text-sm text-center max-w-sm mb-6">You are not currently assigned to any tasks as a team member. Tasks will appear here when you&apos;re added to project teams.</p>
		</div>
	);
}

// Loading Skeleton
function TaskListSkeleton() {
	return (
		<div className="space-y-3">
			{[...Array(5)].map((_, i) => (
				<div
					key={i}
					className="bg-card border rounded-lg p-4"
				>
					<div className="flex items-start gap-3">
						<div className="flex items-center gap-2 shrink-0">
							<div className="w-4 h-4 bg-muted rounded animate-pulse" />
							<div className="w-1 h-12 bg-muted rounded animate-pulse" />
						</div>
						<div className="flex-1 space-y-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 bg-muted rounded-full animate-pulse" />
									<div className="h-5 bg-muted rounded animate-pulse w-48" />
									<div className="h-4 bg-muted rounded animate-pulse w-16" />
								</div>
								<div className="h-7 bg-muted rounded animate-pulse w-16" />
							</div>
							<div className="flex items-center gap-6">
								<div className="h-4 bg-muted rounded animate-pulse w-24" />
								<div className="h-4 bg-muted rounded animate-pulse w-20" />
								<div className="h-4 bg-muted rounded animate-pulse w-16" />
								<div className="h-4 bg-muted rounded animate-pulse w-20" />
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
