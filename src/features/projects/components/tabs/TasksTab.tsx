"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SearchInput, FilterBar, FilterSelect, ConfirmDialog } from "@/components/shared";
import { useProjectTasks, useDeleteTask } from "@/features/dashboard/hooks/useTasks";
import { useTaskChildren } from "@/features/dashboard/hooks/useTaskTree";
import { Task, TaskStatus, TaskStatusLabels, TaskStatusColors, TaskType, TaskTypeLabels, TaskTypeColors, TaskPriority, TaskPriorityLabels, TaskPriorityColors, TaskChildrenResponse } from "@/features/dashboard/types/task";
import { TaskFormDialog } from "./TaskFormDialog";
import { TaskDetailSheet } from "../tasks/TaskDetailSheet";
import { Plus, ListTodo, Clock, MoreHorizontal, Pencil, Trash2, ChevronRight, ChevronDown, Calendar, Users, CheckCircle2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { usePermissions } from "@/features/admin/hooks/usePermissions";

const STATUS_OPTIONS = Object.values(TaskStatus).map((status) => ({
	value: status,
	label: TaskStatusLabels[status],
}));

const PRIORITY_OPTIONS = Object.values(TaskPriority).map((priority) => ({
	value: priority,
	label: TaskPriorityLabels[priority],
}));

interface TasksTabProps {
	projectId: number;
}

export function TasksTab({ projectId }: TasksTabProps) {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>();
	const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>();

	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [createParentId, setCreateParentId] = useState<number | null>(null);
	const [createType, setCreateType] = useState<TaskType>(TaskType.MAIN);
	const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
	const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
	const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

	const { data, isLoading, error } = useProjectTasks(projectId, page, 20);
	const deleteTask = useDeleteTask();

	// Permission checks
	const { canCreateTasks, canEditTasks, canDeleteTasks } = usePermissions();

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

	// Handlers that work for any task at any level
	const handleSelectTask = useCallback((task: Task) => {
		setSelectedTaskId(task.taskId);
	}, []);

	const handleEditTask = useCallback((task: Task) => {
		setTaskToEdit(task);
	}, []);

	const handleDeleteTask = useCallback((task: Task) => {
		setTaskToDelete(task);
	}, []);

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
			return true;
		}) || [];

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold flex items-center gap-2">
						<ListTodo className="h-5 w-5" />
						Tasks
						{data?.pagination && <Badge variant="secondary">{data.pagination.total}</Badge>}
					</h2>
				</div>
				{canCreateTasks && (
					<Button
						onClick={() => {
							setCreateParentId(null);
							setCreateType(TaskType.MAIN);
							setShowCreateDialog(true);
						}}
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Main Task
					</Button>
				)}
			</div>

			{/* Filters */}
			<FilterBar>
				<SearchInput
					value={search}
					onChange={handleSearch}
					placeholder="Search tasks..."
					className="w-64"
					autoSearch
				/>
				<FilterSelect
					value={statusFilter || ""}
					onChange={(v) => setStatusFilter((v as TaskStatus) || undefined)}
					options={STATUS_OPTIONS}
					placeholder="Status"
					className="w-36"
				/>
				<FilterSelect
					value={priorityFilter || ""}
					onChange={(v) => setPriorityFilter((v as TaskPriority) || undefined)}
					options={PRIORITY_OPTIONS}
					placeholder="Priority"
					className="w-36"
				/>
			</FilterBar>

			{/* Task List */}
			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
				</div>
			) : error ? (
				<div className="text-center py-12 text-destructive">Failed to load tasks</div>
			) : filteredTasks.length === 0 ? (
				<div className="text-center py-12">
					<ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<h3 className="text-lg font-medium">No tasks yet</h3>
					<p className="text-muted-foreground mb-4">Create your first task to start tracking work</p>
					{canCreateTasks && (
						<Button onClick={() => setShowCreateDialog(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Create Task
						</Button>
					)}
				</div>
			) : (
				<div className="space-y-2">
					{filteredTasks.map((task) => (
						<TaskTreeItem
							key={task.taskId}
							task={task}
							level={0}
							onSelect={handleSelectTask}
							onEdit={canEditTasks ? handleEditTask : undefined}
							onDelete={canDeleteTasks ? handleDeleteTask : undefined}
							onCreateChild={canCreateTasks ? handleCreateChild : undefined}
							canEdit={canEditTasks}
							canDelete={canDeleteTasks}
							canCreate={canCreateTasks}
						/>
					))}
				</div>
			)}

			{/* Pagination */}
			{data?.pagination && data.pagination.totalPages > 1 && (
				<div className="flex items-center justify-center gap-2 pt-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
					>
						Previous
					</Button>
					<span className="text-sm text-muted-foreground">
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
	);
}

interface TaskTreeItemProps {
	task: Task;
	level: number;
	onSelect: (task: Task) => void;
	onEdit?: (task: Task) => void;
	onDelete?: (task: Task) => void;
	onCreateChild?: (parentTask: Task, type: TaskType) => void;
	canEdit?: boolean;
	canDelete?: boolean;
	canCreate?: boolean;
}

function TaskTreeItem({ task, level, onSelect, onEdit, onDelete, onCreateChild, canEdit, canDelete, canCreate }: TaskTreeItemProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const { data: childrenData, isLoading: loadingChildren } = useTaskChildren(task.taskId, isExpanded) as {
		data: TaskChildrenResponse | undefined;
		isLoading: boolean;
	};

	const loadedChildren = childrenData?.children || [];
	const hasChildren = (task.children && task.children.length > 0) || loadedChildren.length > 0;
	const childTasks = loadedChildren.length > 0 ? loadedChildren : task.children || [];

	const progressPercent = task.estimatedHours > 0 ? Math.min((task.totalTimeSpent / 60 / task.estimatedHours) * 100, 100) : 0;

	return (
		<div className={cn("border rounded-lg", level > 0 && "ml-6 border-l-2 border-l-primary/20")}>
			<Collapsible
				open={isExpanded}
				onOpenChange={setIsExpanded}
			>
				<div className="flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors">
					{/* Expand/Collapse */}
					<CollapsibleTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 shrink-0"
						>
							{loadingChildren ? (
								<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
							) : hasChildren || task.type !== TaskType.SUBTASK ? (
								isExpanded ? (
									<ChevronDown className="h-4 w-4" />
								) : (
									<ChevronRight className="h-4 w-4" />
								)
							) : (
								<div className="w-4" />
							)}
						</Button>
					</CollapsibleTrigger>

					{/* Main Content - Clickable */}
					<div
						className="flex-1 min-w-0 cursor-pointer"
						onClick={() => onSelect(task)}
					>
						<div className="flex items-center gap-2 flex-wrap">
							<Badge
								variant="outline"
								className={cn("text-xs", TaskPriorityColors[task.priority])}
							>
								{TaskPriorityLabels[task.priority]}
							</Badge>
							<Badge
								variant="outline"
								className={cn("text-xs font-medium", TaskTypeColors[task.type])}
							>
								{TaskTypeLabels[task.type]}
							</Badge>
							<span className="font-medium truncate">{task.title}</span>
						</div>

						<div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
							{/* Status */}
							<Badge className={cn("text-xs", TaskStatusColors[task.status])}>{TaskStatusLabels[task.status]}</Badge>

							{/* Assignees */}
							{task.assignees && task.assignees.length > 0 && (
								<div className="flex items-center gap-1">
									<Users className="h-3 w-3" />
									<span>{task.assignees.length}</span>
								</div>
							)}

							{/* Time */}
							<div className="flex items-center gap-1">
								<Clock className="h-3 w-3" />
								<span>
									{Math.floor(task.totalTimeSpent / 60)}h / {task.estimatedHours}h
								</span>
							</div>

							{/* Due Date */}
							{task.dueDate && (
								<div className="flex items-center gap-1">
									<Calendar className="h-3 w-3" />
									<span>{format(new Date(task.dueDate), "MMM d")}</span>
								</div>
							)}

							{/* Test Completion */}
							{task.testCompletionPercentage !== undefined && task.testCompletionPercentage < 100 && (
								<div className="flex items-center gap-1">
									<CheckCircle2 className="h-3 w-3" />
									<span>{task.testCompletionPercentage}%</span>
								</div>
							)}

							{/* Tags */}
							{task.tags && task.tags.length > 0 && (
								<div className="flex gap-1">
									{task.tags.slice(0, 2).map((tag) => (
										<Badge
											key={tag.tagId}
											variant="secondary"
											className="text-xs px-1"
											style={{ backgroundColor: tag.color + "20", color: tag.color }}
										>
											{tag.name}
										</Badge>
									))}
									{task.tags.length > 2 && <span className="text-xs">+{task.tags.length - 2}</span>}
								</div>
							)}
						</div>
					</div>

					{/* Progress */}
					<div className="w-20 shrink-0">
						<Progress
							value={progressPercent}
							className="h-1.5"
						/>
					</div>

					{/* Actions */}
					{(canEdit || canDelete || canCreate) && (
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
							<DropdownMenuContent align="end">
								{canEdit && onEdit && (
									<DropdownMenuItem onClick={() => onEdit(task)}>
										<Pencil className="h-4 w-4 mr-2" />
										Edit
									</DropdownMenuItem>
								)}
								{canCreate && onCreateChild && task.type === TaskType.MAIN && (
									<DropdownMenuItem onClick={() => onCreateChild(task, TaskType.WEEKLY)}>
										<Plus className="h-4 w-4 mr-2" />
										Add Weekly Task
									</DropdownMenuItem>
								)}
								{canCreate && onCreateChild && task.type === TaskType.WEEKLY && (
									<DropdownMenuItem onClick={() => onCreateChild(task, TaskType.SUBTASK)}>
										<Plus className="h-4 w-4 mr-2" />
										Add Subtask
									</DropdownMenuItem>
								)}
								{canDelete && onDelete && (
									<>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => onDelete(task)}
											className="text-destructive"
										>
											<Trash2 className="h-4 w-4 mr-2" />
											Delete
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>

				{/* Children - Pass the same handlers down */}
				<CollapsibleContent>
					{childTasks.length > 0 && (
						<div className="border-t">
							{childTasks.map((child) => (
								<TaskTreeItem
									key={child.taskId}
									task={child}
									level={level + 1}
									onSelect={onSelect}
									onEdit={onEdit}
									onDelete={onDelete}
									onCreateChild={onCreateChild}
									canEdit={canEdit}
									canDelete={canDelete}
									canCreate={canCreate}
								/>
							))}
						</div>
					)}
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}
