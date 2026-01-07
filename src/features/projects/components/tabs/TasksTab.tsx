"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge, TaskTypeBadge, TaskPriorityBadge, TaskCategoryBadge } from "@/components/shared/StatusBadge";
import { SearchInput, FilterBar, FilterSelect, ConfirmDialog } from "@/components/shared";
import { useProjectTasks, useDeleteTask } from "@/features/dashboard/hooks/useTasks";
import { useTaskChildren } from "@/features/dashboard/hooks/useTaskTree";
import { useTaskCategories } from "@/features/admin/hooks/useEnums";
import { Task, TaskStatus, TaskStatusLabels, TaskType, TaskTypeLabels, TaskPriority, TaskPriorityLabels, TaskChildrenResponse } from "@/features/dashboard/types/task";
import { TaskFormDialog } from "./TaskFormDialog";
import { TaskDetailSheet } from "../tasks/TaskDetailSheet";
import { Plus, ListTodo, Clock, MoreHorizontal, Pencil, Trash2, ChevronRight, ChevronDown, Calendar, AlertCircle, CheckCircle2, Circle, Timer } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const STATUS_OPTIONS = Object.values(TaskStatus).map((status) => ({
	value: status,
	label: TaskStatusLabels[status],
}));

const PRIORITY_OPTIONS = Object.values(TaskPriority).map((priority) => ({
	value: priority,
	label: TaskPriorityLabels[priority],
}));

// This will be defined after the hook call

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

interface TasksTabProps {
	projectId: number;
}

export function TasksTab({ projectId }: TasksTabProps) {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>();
	const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>();
	const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
	const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());

	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [createParentId, setCreateParentId] = useState<number | null>(null);
	const [createType, setCreateType] = useState<TaskType>(TaskType.MAIN);
	const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
	const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
	const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

	const { data, isLoading, error } = useProjectTasks(projectId, page, 20);
	const { data: taskCategoriesData } = useTaskCategories();
	const deleteTask = useDeleteTask();
	const { canEditTasks, canDeleteTasks, canCreateMainTasks, canCreateWeeklyTasks, canCreateSubtasks, canEditMainTasks, canEditWeeklyTasks, canEditSubtasks } = usePermissions();

	// Transform task categories to filter options
	const CATEGORY_OPTIONS = [
		{ value: "all", label: "All Categories" },
		...(taskCategoriesData?.data?.map((category: { value: string; label: string }) => ({
			value: category.value,
			label: category.label,
		})) || []),
	];

	// Determine if user can create main tasks (admin only) or just subtasks
	const canCreateMainOrWeekly = canCreateMainTasks || canCreateWeeklyTasks;

	const handleSearch = (value: string) => {
		setSearch(value);
		setPage(1);
	};

	const handleDelete = async () => {
		if (!taskToDelete) return;
		try {
			await deleteTask.mutateAsync({ id: taskToDelete.taskId, projectId });
			toast.success("Task deleted successfully");
			setTaskToDelete(null);
		} catch {
			toast.error("Failed to delete task");
		}
	};

	const toggleExpand = useCallback((taskId: number) => {
		setExpandedTasks((prev) => {
			const next = new Set(prev);
			if (next.has(taskId)) next.delete(taskId);
			else next.add(taskId);
			return next;
		});
	}, []);

	const handleSelectTask = useCallback((task: Task) => setSelectedTaskId(task.taskId), []);
	const handleEditTask = useCallback((task: Task) => setTaskToEdit(task), []);
	const handleDeleteTask = useCallback((task: Task) => setTaskToDelete(task), []);
	const handleCreateChild = useCallback((parentTask: Task, type: TaskType) => {
		setCreateParentId(parentTask.taskId);
		setCreateType(type);
		setShowCreateDialog(true);
	}, []);

	const filteredTasks =
		data?.tasks?.filter((task) => {
			if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
			if (statusFilter && task.status !== statusFilter) return false;
			if (priorityFilter && task.priority !== priorityFilter) return false;
			if (categoryFilter && task.taskCategory !== categoryFilter) return false;
			return true;
		}) || [];

	// Calculate stats
	const stats = {
		total: data?.pagination?.total || 0,
		done: filteredTasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
		inProgress: filteredTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
		review: filteredTasks.filter((t) => t.status === TaskStatus.REVIEW).length,
	};

	return (
		<TooltipProvider>
			<div className="space-y-6">
				{/* Header with Stats */}
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<h2 className="text-xl font-semibold tracking-tight">Tasks</h2>
						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							<span>{stats.total} total</span>
							<span className="text-green-600">{stats.done} done</span>
							<span className="text-blue-600">{stats.inProgress} in progress</span>
							{stats.review > 0 && <span className="text-amber-600">{stats.review} in review</span>}
						</div>
					</div>
					{canCreateMainOrWeekly && (
						<Button
							onClick={() => {
								setCreateParentId(null);
								setCreateType(TaskType.MAIN);
								setShowCreateDialog(true);
							}}
							size="sm"
						>
							<Plus className="h-4 w-4 mr-2" />
							New Task
						</Button>
					)}
				</div>

				{/* Filters */}
				<FilterBar className="bg-muted/30 rounded-lg p-3">
					<SearchInput
						value={search}
						onChange={handleSearch}
						placeholder="Search tasks..."
						className="w-72"
						autoSearch
					/>
					<FilterSelect
						value={statusFilter || ""}
						onChange={(v) => setStatusFilter((v as TaskStatus) || undefined)}
						options={STATUS_OPTIONS}
						placeholder="All Status"
						className="w-40"
					/>
					<FilterSelect
						value={priorityFilter || ""}
						onChange={(v) => setPriorityFilter((v as TaskPriority) || undefined)}
						options={PRIORITY_OPTIONS}
						placeholder="All Priority"
						className="w-40"
					/>
					<FilterSelect
						value={categoryFilter || ""}
						onChange={(v) => setCategoryFilter(v || undefined)}
						options={CATEGORY_OPTIONS}
						placeholder="All Categories"
						className="w-40"
					/>
				</FilterBar>

				{/* Task List */}
				{isLoading ? (
					<TaskListSkeleton />
				) : error ? (
					<div className="text-center py-16 text-destructive">
						<AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
						<p>Failed to load tasks</p>
					</div>
				) : filteredTasks.length === 0 ? (
					<EmptyState
						canCreate={canCreateMainOrWeekly}
						onCreate={() => setShowCreateDialog(true)}
					/>
				) : (
					<div className="border rounded-xl overflow-hidden bg-card">
						{/* Table Header */}
						<div className="grid grid-cols-[1fr_120px_140px_100px_50px] gap-4 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
							<div>Task</div>
							<div>Assignees</div>
							<div>Due Date</div>
							<div>Time</div>
							<div></div>
						</div>
						{/* Task Rows */}
						<div className="divide-y">
							{filteredTasks.map((task) => (
								<TaskRow
									key={task.taskId}
									task={task}
									level={0}
									isExpanded={expandedTasks.has(task.taskId)}
									onToggle={() => toggleExpand(task.taskId)}
									onSelect={handleSelectTask}
									onEdit={canEditTasks ? handleEditTask : undefined}
									onDelete={canDeleteTasks ? handleDeleteTask : undefined}
									onCreateChild={canCreateWeeklyTasks || canCreateSubtasks ? handleCreateChild : undefined}
									canCreateWeeklyTasks={canCreateWeeklyTasks}
									canCreateSubtasks={canCreateSubtasks}
									canEditMainTasks={canEditMainTasks}
									canEditWeeklyTasks={canEditWeeklyTasks}
									canEditSubtasks={canEditSubtasks}
									expandedTasks={expandedTasks}
									onToggleExpand={toggleExpand}
								/>
							))}
						</div>
					</div>
				)}

				{/* Pagination */}
				{data?.pagination && data.pagination.totalPages > 1 && (
					<div className="flex items-center justify-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
						>
							Previous
						</Button>
						<span className="text-sm text-muted-foreground px-4">
							Page {page} of {data.pagination.totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
							disabled={page === data.pagination.totalPages}
						>
							Next
						</Button>
					</div>
				)}

				{/* Dialogs */}
				<TaskFormDialog
					projectId={projectId}
					parentId={createParentId}
					open={showCreateDialog || !!taskToEdit}
					onOpenChange={(open) => {
						if (!open) {
							setShowCreateDialog(false);
							setTaskToEdit(null);
							setCreateParentId(null);
						}
					}}
					task={taskToEdit}
					defaultType={createType}
				/>
				<TaskDetailSheet
					taskId={selectedTaskId}
					open={!!selectedTaskId}
					onOpenChange={(open) => !open && setSelectedTaskId(null)}
					onEdit={(task) => {
						setSelectedTaskId(null);
						setTaskToEdit(task);
					}}
				/>
				<ConfirmDialog
					open={!!taskToDelete}
					onOpenChange={() => setTaskToDelete(null)}
					title="Delete Task"
					description={`Are you sure you want to delete "${taskToDelete?.title}"? This will also delete all subtasks.`}
					confirmLabel="Delete"
					onConfirm={handleDelete}
					variant="destructive"
					isLoading={deleteTask.isPending}
				/>
			</div>
		</TooltipProvider>
	);
}

// Task Row Component - Clean & Minimal
interface TaskRowProps {
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
}

function TaskRow({ task, level, isExpanded, onToggle, onSelect, onEdit, onDelete, onCreateChild, canCreateWeeklyTasks, canCreateSubtasks, canEditMainTasks, canEditWeeklyTasks, canEditSubtasks, expandedTasks, onToggleExpand }: TaskRowProps) {
	const { data: childrenData, isLoading: loadingChildren } = useTaskChildren(task.taskId, isExpanded) as {
		data: TaskChildrenResponse | undefined;
		isLoading: boolean;
	};

	const loadedChildren = childrenData?.children || [];
	const hasChildren = (task.children && task.children.length > 0) || loadedChildren.length > 0;
	const childTasks = loadedChildren.length > 0 ? loadedChildren : task.children || [];
	const canExpand = hasChildren || task.type !== TaskType.SUBTASK;

	const timeSpentHours = Math.floor(task.totalTimeSpent / 60);
	const timeSpentMins = task.totalTimeSpent % 60;
	const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== TaskStatus.COMPLETED;
	const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

	// Determine if user can edit this specific task based on its type
	const canEditThisTask = onEdit && ((task.type === TaskType.MAIN && canEditMainTasks) || (task.type === TaskType.WEEKLY && canEditWeeklyTasks) || (task.type === TaskType.SUBTASK && canEditSubtasks));

	return (
		<>
			<div className={cn("grid grid-cols-[1fr_120px_140px_100px_50px] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors group", task.status === TaskStatus.COMPLETED && "opacity-60")}>
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
				{onCreateChild && canCreateWeeklyTasks && (
					<div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
										<Pencil className="h-4 w-4 mr-2" /> Edit Task
									</DropdownMenuItem>
								)}
								{onCreateChild && canCreateWeeklyTasks && task.type === TaskType.MAIN && task.status !== TaskStatus.COMPLETED && (
									<DropdownMenuItem onClick={() => onCreateChild(task, TaskType.WEEKLY)}>
										<Plus className="h-4 w-4 mr-2" /> Add Weekly Task
									</DropdownMenuItem>
								)}
								{onCreateChild && canCreateSubtasks && task.type === TaskType.WEEKLY && task.status !== TaskStatus.COMPLETED && (
									<DropdownMenuItem onClick={() => onCreateChild(task, TaskType.SUBTASK)}>
										<Plus className="h-4 w-4 mr-2" /> Add Subtask
									</DropdownMenuItem>
								)}
								{onDelete && (
									<>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => onDelete(task)}
											className="text-destructive focus:text-destructive"
										>
											<Trash2 className="h-4 w-4 mr-2" /> Delete
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}
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
						/>
					))}
				</>
			)}
		</>
	);
}

// Empty State Component
function EmptyState({ canCreate, onCreate }: { canCreate: boolean; onCreate: () => void }) {
	return (
		<div className="flex flex-col items-center justify-center py-16 px-4">
			<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
				<ListTodo className="h-8 w-8 text-muted-foreground" />
			</div>
			<h3 className="text-lg font-semibold mb-1">No tasks yet</h3>
			<p className="text-muted-foreground text-sm text-center max-w-sm mb-6">Start organizing your project by creating tasks. Break down work into manageable pieces.</p>
			{canCreate && (
				<Button onClick={onCreate}>
					<Plus className="h-4 w-4 mr-2" />
					Create First Task
				</Button>
			)}
		</div>
	);
}

// Loading Skeleton
function TaskListSkeleton() {
	return (
		<div className="border rounded-xl overflow-hidden bg-card">
			<div className="grid grid-cols-[1fr_120px_140px_100px_50px] gap-4 px-4 py-3 bg-muted/50 border-b">
				{[...Array(5)].map((_, i) => (
					<div
						key={i}
						className="h-4 bg-muted rounded animate-pulse"
					/>
				))}
			</div>
			<div className="divide-y">
				{[...Array(5)].map((_, i) => (
					<div
						key={i}
						className="grid grid-cols-[1fr_120px_140px_100px_50px] gap-4 px-4 py-4"
					>
						<div className="flex items-center gap-3">
							<div className="w-4 h-4 bg-muted rounded animate-pulse" />
							<div className="w-1 h-8 bg-muted rounded animate-pulse" />
							<div className="w-4 h-4 bg-muted rounded-full animate-pulse" />
							<div className="flex-1 h-5 bg-muted rounded animate-pulse" />
						</div>
						<div className="flex -space-x-2">
							{[...Array(2)].map((_, j) => (
								<div
									key={j}
									className="w-7 h-7 bg-muted rounded-full animate-pulse"
								/>
							))}
						</div>
						<div className="h-5 bg-muted rounded animate-pulse w-20" />
						<div className="h-5 bg-muted rounded animate-pulse w-16" />
						<div className="h-8 w-8 bg-muted rounded animate-pulse" />
					</div>
				))}
			</div>
		</div>
	);
}
