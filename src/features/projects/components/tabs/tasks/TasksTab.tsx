/**
 * Tasks Tab Component
 * Main tasks management tab for projects
 */

"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { SearchInput, FilterBar, FilterSelect, ConfirmDialog } from "@/components/shared";
import { useProjectTasks, useDeleteTask } from "@/features/dashboard/hooks/useTasks";
import { useTaskCategories } from "@/features/admin/hooks/useEnums";
import { useAuthStore } from "@/store/authStore";
import { Task, TaskStatus, TaskType, TaskPriority } from "@/features/dashboard/types/task";
import { TaskFormDialog } from "../TaskFormDialog";
import { TaskDetailSheet } from "../../tasks/TaskDetailSheet";
import { Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { TooltipProvider } from "@/components/ui/tooltip";
import { dedupeTaskTree } from "@/features/dashboard/utils/taskTree";

import { TaskRow } from "./TaskRow";
import { TasksEmptyState } from "./TasksEmptyState";
import { TasksListSkeleton } from "./TasksListSkeleton";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "./constants";

interface TasksTabProps {
	projectId: number;
}

export function TasksTab({ projectId }: TasksTabProps) {
	const { user, role } = useAuthStore();
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>();
	const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>();
	const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
	const [showMyTasksOnly] = useState(role !== "admin" && role !== "super-admin" && role !== "manager");
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

	const CATEGORY_OPTIONS = [
		{ value: "all", label: "All Categories" },
		...(taskCategoriesData?.data?.map((category: { value: string; label: string }) => ({
			value: category.value,
			label: category.label,
		})) || []),
	];

	const canCreateMainOrWeekly = canCreateMainTasks || canCreateWeeklyTasks;
	const isAdminOrSuperAdmin = role === "admin" || role === "super-admin";

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

	// Filter tasks
	const filteredTasks =
		data?.tasks?.filter((task) => {
			if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
			if (statusFilter && task.status !== statusFilter) return false;
			if (priorityFilter && task.priority !== priorityFilter) return false;
			if (categoryFilter && task.taskCategory !== categoryFilter) return false;
			if (showMyTasksOnly && !isAdminOrSuperAdmin) {
				const isAssigned = task.assignees?.some((assignee) => assignee.userId === user?.userId);
				if (!isAssigned) return false;
			}
			return true;
		}) || [];

	// Recursive filter for children
	const filterTasksRecursively = (tasks: Task[]): Task[] => {
		return tasks
			.map((task) => ({
				...task,
				children: task.children ? filterTasksRecursively(task.children) : [],
			}))
			.filter((task) => {
				if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
				if (statusFilter && task.status !== statusFilter) return false;
				if (priorityFilter && task.priority !== priorityFilter) return false;
				if (categoryFilter && task.taskCategory !== categoryFilter) return false;
				if (showMyTasksOnly && !isAdminOrSuperAdmin) {
					const isAssigned = task.assignees?.some((assignee) => assignee.userId === user?.userId);
					const hasAssignedChildren = task.children?.some((child) => child.assignees?.some((assignee) => assignee.userId === user?.userId));
					if (!isAssigned && !hasAssignedChildren) return false;
				}
				return true;
			});
	};

	const finalFilteredTasks = dedupeTaskTree(filterTasksRecursively(filteredTasks));

	// Stats
	const stats = {
		total: data?.pagination?.total || 0,
		done: finalFilteredTasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
		inProgress: finalFilteredTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
		review: finalFilteredTasks.filter((t) => t.status === TaskStatus.REVIEW).length,
		myTasks: showMyTasksOnly ? finalFilteredTasks.length : finalFilteredTasks.filter((t) => t.assignees?.some((assignee) => assignee.userId === user?.userId)).length,
	};

	return (
		<TooltipProvider>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<h2 className="text-xl font-semibold tracking-tight">Tasks</h2>
						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							<span>{stats.total} total</span>
							<span className="text-green-600">{stats.done} done</span>
							<span className="text-blue-600">{stats.inProgress} in progress</span>
							{stats.review > 0 && <span className="text-amber-600">{stats.review} in review</span>}
							{!isAdminOrSuperAdmin && <span className="text-purple-600">{stats.myTasks} assigned to me</span>}
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
							<Plus className="h-4 w-4 me-2" />
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
					<TasksListSkeleton />
				) : error ? (
					<div className="text-center py-16 text-destructive">
						<AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
						<p>Failed to load tasks</p>
					</div>
				) : finalFilteredTasks.length === 0 ? (
					<TasksEmptyState
						canCreate={canCreateMainOrWeekly}
						onCreate={() => setShowCreateDialog(true)}
						showMyTasksOnly={showMyTasksOnly}
						isAdminOrSuperAdmin={isAdminOrSuperAdmin}
					/>
				) : (
					<div className="border rounded-xl overflow-hidden bg-card">
						<div className="grid grid-cols-[minmax(0,1fr)_120px_140px_160px_100px_100px] gap-4 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
							<div>Task</div>
							<div>Assignees</div>
							<div>Due Date</div>
							<div>Expected Close</div>
							<div>Time</div>
							<div></div>
						</div>
						<div className="divide-y">
							{finalFilteredTasks.map((task) => (
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
									currentUserId={user?.userId}
									showMyTasksOnly={showMyTasksOnly}
									isAdminOrSuperAdmin={isAdminOrSuperAdmin}
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
