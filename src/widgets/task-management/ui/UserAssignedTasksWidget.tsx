"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, closestCorners, useSensor, useSensors } from "@dnd-kit/core";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, LayoutGrid, List, ListTodo, Plus } from "lucide-react";
import { toast } from "sonner";
import { projectApi } from "@/entities/project/api/project.api";
import { projectKeys } from "@/entities/project/model/query-keys";
import { taskApi } from "@/entities/task/api/task.api";
import { taskKeys } from "@/entities/task/model/query-keys";
import { Task, TaskFilters, TaskPriority, TaskPriorityLabels, TaskStatus, TaskStatusLabels } from "@/entities/task/model/types";
import { TaskCard } from "@/entities/task/ui/TaskCard";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { useTaskPermissions } from "@/entities/user/model/permissions";
import { useDeleteTask, useUpdateTask } from "@/features/tasks/model/use-task-actions";
import { ChangeTaskStatusDropzone, DraggableTaskCard, isTaskDragPayload, isTaskStatusDropPayload } from "@/features/tasks/ui/ChangeTaskStatusDropzone";
import { CreateTaskForm } from "@/features/tasks/ui/CreateTaskForm";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { FilterSelect } from "@/shared/ui/filters/FilterSelect";
import { SearchInput } from "@/shared/ui/filters/SearchInput";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface UserAssignedTasksWidgetProps {
	compact?: boolean;
	perPage?: number;
	className?: string;
}

type TaskViewMode = "kanban" | "list";

const KANBAN_STATUSES = Object.values(TaskStatus);
const PRIORITY_OPTIONS = Object.values(TaskPriority).map((priority) => ({
	value: priority,
	label: TaskPriorityLabels[priority],
}));

function flattenTasks(tasks: Task[]): Task[] {
	return tasks.flatMap((task) => [task, ...flattenTasks(task.children ?? [])]);
}

function groupTasksByStatus(tasks: Task[]) {
	return KANBAN_STATUSES.reduce(
		(groupedTasks, status) => {
			groupedTasks[status] = tasks.filter((task) => task.status === status);
			return groupedTasks;
		},
		{} as Record<TaskStatus, Task[]>
	);
}

function extractActionableTasks(tasks: Task[]) {
	return flattenTasks(tasks).filter((task) => task.canStartTimer || !task.hasChildren);
}

export function UserAssignedTasksWidget({ compact = false, perPage = compact ? 5 : 100, className }: UserAssignedTasksWidgetProps) {
	const user = useAuthStore((state) => state.user);
	const searchParams = useSearchParams();
	const highlightedTaskId = searchParams.get("highlight") ? Number(searchParams.get("highlight")) : null;
	const [view, setView] = useState<TaskViewMode>(compact ? "list" : "kanban");
	const [filters, setFilters] = useState<TaskFilters>({ page: 1, perPage });
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [activeTask, setActiveTask] = useState<Task | null>(null);
	const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
	const { canCreateTasks, canEditTasks, canDeleteTasks } = useTaskPermissions();
	const updateTask = useUpdateTask();
	const deleteTask = useDeleteTask();
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor));

	const tasksQuery = useQuery({
		queryKey: taskKeys.myAssigned(filters),
		queryFn: () => taskApi.getMyAssignedTasks(filters),
		staleTime: 5 * 60 * 1000,
	});

	const projectsQuery = useQuery({
		queryKey: projectKeys.list({ perPage: 100 }),
		queryFn: () => projectApi.getProjects({ perPage: 100 }),
		enabled: !compact,
		staleTime: 5 * 60 * 1000,
	});

	const tasks = useMemo(() => tasksQuery.data?.tasks ?? [], [tasksQuery.data]);
	const flattenedTasks = useMemo(() => flattenTasks(tasks), [tasks]);
	const actionableTasks = useMemo(() => extractActionableTasks(tasks), [tasks]);
	const tasksByStatus = useMemo(() => groupTasksByStatus(actionableTasks), [actionableTasks]);
	const totalTasks = tasksQuery.data?.pagination?.total ?? flattenedTasks.length;

	const projectFilterOptions = useMemo(
		() =>
			(projectsQuery.data?.projects ?? []).map((project) => ({
				value: String(project.projectId),
				label: project.title,
			})),
		[projectsQuery.data?.projects]
	);

	const updateFilter = (partialFilter: Partial<TaskFilters>) => {
		setFilters((currentFilters) => ({
			...currentFilters,
			...partialFilter,
			page: partialFilter.page ?? 1,
		}));
	};

	const updateTaskStatus = async (task: Task, status: TaskStatus) => {
		if (task.status === status || updateTask.isPending) {
			return;
		}

		try {
			await updateTask.mutateAsync({ id: task.taskId, payload: { status } });
			toast.success(`Task moved to ${TaskStatusLabels[status]}`);
		} catch {
			toast.error("Failed to update task status");
		}
	};

	const handleDragStart = (event: DragStartEvent) => {
		const payload = event.active.data.current;
		if (!isTaskDragPayload(payload)) {
			return;
		}

		setActiveTask(actionableTasks.find((task) => task.taskId === payload.taskId) ?? null);
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const activePayload = event.active.data.current;
		const overPayload = event.over?.data.current;
		setActiveTask(null);

		if (!isTaskDragPayload(activePayload) || !isTaskStatusDropPayload(overPayload)) {
			return;
		}

		const task = actionableTasks.find((item) => item.taskId === activePayload.taskId);
		if (!task) {
			return;
		}

		await updateTaskStatus(task, overPayload.status);
	};

	const handleConfirmDelete = async () => {
		if (!taskToDelete) {
			return;
		}

		try {
			await deleteTask.mutateAsync({ id: taskToDelete.taskId, projectId: taskToDelete.projectId });
			toast.success("Task deleted");
			setTaskToDelete(null);
		} catch {
			toast.error("Failed to delete task");
		}
	};

	if (compact) {
		return (
			<section className={cn("overflow-hidden rounded-md border bg-background", className)}>
				<div className="flex items-start justify-between gap-3 border-b px-3 py-3">
					<div>
						<h3 className="text-sm font-medium">My Assigned Tasks</h3>
						<p className="text-xs text-muted-foreground">{tasksQuery.isLoading ? "Loading assigned tasks" : `${totalTasks} assigned tasks`}</p>
					</div>
					<Button
						asChild
						variant="outline"
						size="sm"
					>
						<Link href="/dashboard/my-tasks">
							<ExternalLink data-icon="inline-start" />
							View all
						</Link>
					</Button>
				</div>

				{tasksQuery.isLoading ? (
					<CompactTasksSkeleton />
				) : tasksQuery.error ? (
					<div className="flex min-h-32 items-center justify-center px-4 text-center text-sm text-muted-foreground">Unable to load assigned tasks</div>
				) : flattenedTasks.length === 0 ? (
					<div className="flex min-h-32 flex-col items-center justify-center gap-2 px-4 text-center">
						<ListTodo className="size-5 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">No assigned tasks</p>
					</div>
				) : (
					flattenedTasks.slice(0, perPage).map((task) => (
						<TaskCard
							key={task.taskId}
							task={task}
							compact
							isHighlighted={highlightedTaskId === task.taskId}
							onStatusChange={canEditTasks ? updateTaskStatus : undefined}
						/>
					))
				)}
			</section>
		);
	}

	return (
		<section className={cn("flex flex-col gap-4", className)}>
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">My Tasks</h1>
					<p className="text-sm text-muted-foreground">Manage assigned work across projects and personal tasks.</p>
				</div>

				{canCreateTasks && (
					<Button
						size="sm"
						onClick={() => setCreateDialogOpen(true)}
					>
						<Plus data-icon="inline-start" />
						New task
					</Button>
				)}
			</div>

			<div className="flex flex-col gap-3 border-y py-3 xl:flex-row xl:items-center xl:justify-between">
				<SearchInput
					value={filters.search}
					onChange={(search) => updateFilter({ search: search || undefined })}
					placeholder="Search tasks"
					className="w-full xl:max-w-sm"
					autoSearch={false}
				/>

				<div className="flex flex-col gap-2 md:flex-row md:items-center">
					<FilterSelect
						value={filters.status}
						onChange={(status) => updateFilter({ status: status as TaskStatus | undefined })}
						options={KANBAN_STATUSES.map((status) => ({ value: status, label: TaskStatusLabels[status] }))}
						placeholder="Status"
						allLabel="All statuses"
						className="w-full md:w-44"
					/>
					<FilterSelect
						value={filters.priority}
						onChange={(priority) => updateFilter({ priority: priority as TaskPriority | undefined })}
						options={PRIORITY_OPTIONS}
						placeholder="Priority"
						allLabel="All priorities"
						className="w-full md:w-44"
					/>
					<FilterSelect
						value={filters.projectId ? String(filters.projectId) : undefined}
						onChange={(projectId) => updateFilter({ projectId: projectId ? Number(projectId) : undefined })}
						options={projectFilterOptions}
						placeholder="Project"
						allLabel="All projects"
						className="w-full md:w-56"
						disabled={projectsQuery.isLoading}
					/>
					<div className="inline-flex rounded-md border p-0.5">
						<Button
							type="button"
							variant={view === "kanban" ? "secondary" : "ghost"}
							size="sm"
							onClick={() => setView("kanban")}
						>
							<LayoutGrid data-icon="inline-start" />
							Board
						</Button>
						<Button
							type="button"
							variant={view === "list" ? "secondary" : "ghost"}
							size="sm"
							onClick={() => setView("list")}
						>
							<List data-icon="inline-start" />
							List
						</Button>
					</div>
				</div>
			</div>

			{tasksQuery.isLoading ? (
				view === "kanban" ? <KanbanSkeleton /> : <TaskListSkeleton />
			) : tasksQuery.error ? (
				<div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-md border px-4 text-center">
					<ListTodo className="size-6 text-muted-foreground" />
					<div className="text-sm font-medium">Unable to load tasks</div>
					<div className="text-sm text-muted-foreground">{tasksQuery.error.message}</div>
				</div>
			) : flattenedTasks.length === 0 ? (
				<div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-md border px-4 text-center">
					<ListTodo className="size-6 text-muted-foreground" />
					<div className="flex flex-col gap-1">
						<div className="text-sm font-medium">No assigned tasks</div>
						<div className="text-sm text-muted-foreground">Create a task or adjust the filters.</div>
					</div>
					{canCreateTasks && (
						<Button
							size="sm"
							variant="outline"
							onClick={() => setCreateDialogOpen(true)}
						>
							<Plus data-icon="inline-start" />
							New task
						</Button>
					)}
				</div>
			) : view === "kanban" ? (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCorners}
					onDragStart={handleDragStart}
					onDragEnd={canEditTasks ? handleDragEnd : undefined}
				>
					<div className="flex gap-3 overflow-x-auto pb-2">
						{KANBAN_STATUSES.map((status) => (
							<ChangeTaskStatusDropzone
								key={status}
								status={status}
								count={tasksByStatus[status].length}
								disabled={!canEditTasks}
							>
								{tasksByStatus[status].length === 0 ? (
									<div className="flex min-h-24 items-center justify-center rounded-md border border-dashed bg-background/60 px-3 text-center text-xs text-muted-foreground">Drop tasks here</div>
								) : (
									tasksByStatus[status].map((task) => (
										<DraggableTaskCard
											key={task.taskId}
											task={task}
											disabled={!canEditTasks}
										>
											{({ isDragging, dragHandle }) => (
												<TaskCard
													task={task}
													isDragging={isDragging}
													isHighlighted={highlightedTaskId === task.taskId}
													dragHandle={canEditTasks ? dragHandle : undefined}
													onStatusChange={canEditTasks ? updateTaskStatus : undefined}
													onDelete={canDeleteTasks ? setTaskToDelete : undefined}
												/>
											)}
										</DraggableTaskCard>
									))
								)}
							</ChangeTaskStatusDropzone>
						))}
					</div>
					<DragOverlay>{activeTask && <TaskCard task={activeTask} />}</DragOverlay>
				</DndContext>
			) : (
				<div className="overflow-hidden rounded-md border bg-background">
					{flattenedTasks.map((task) => (
						<TaskCard
							key={task.taskId}
							task={task}
							compact
							isHighlighted={highlightedTaskId === task.taskId}
							onStatusChange={canEditTasks ? updateTaskStatus : undefined}
							onDelete={canDeleteTasks ? setTaskToDelete : undefined}
						/>
					))}
				</div>
			)}

			<CreateTaskForm
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				currentUserId={user?.userId}
				currentUserName={user?.name}
			/>

			<ConfirmDialog
				open={Boolean(taskToDelete)}
				onOpenChange={(open) => {
					if (!open) {
						setTaskToDelete(null);
					}
				}}
				title="Delete task"
				description={
					<span>
						Delete <span className="font-medium text-foreground">{taskToDelete?.title}</span>? This will also remove nested subtasks.
					</span>
				}
				confirmLabel="Delete"
				variant="destructive"
				onConfirm={handleConfirmDelete}
				isLoading={deleteTask.isPending}
			/>
		</section>
	);
}

function CompactTasksSkeleton() {
	return (
		<div className="flex flex-col">
			{Array.from({ length: 4 }).map((_, index) => (
				<div
					key={index}
					className="grid min-h-16 gap-2 border-b px-3 py-2.5 last:border-b-0"
				>
					<Skeleton className="h-4 w-44" />
					<Skeleton className="h-3 w-32" />
				</div>
			))}
		</div>
	);
}

function TaskListSkeleton() {
	return (
		<div className="overflow-hidden rounded-md border bg-background">
			{Array.from({ length: 8 }).map((_, index) => (
				<div
					key={index}
					className="grid min-h-16 gap-2 border-b px-3 py-2.5 last:border-b-0"
				>
					<Skeleton className="h-4 w-56" />
					<Skeleton className="h-3 w-80 max-w-full" />
				</div>
			))}
		</div>
	);
}

function KanbanSkeleton() {
	return (
		<div className="flex gap-3 overflow-x-auto pb-2">
			{KANBAN_STATUSES.map((status) => (
				<div
					key={status}
					className="flex min-h-96 w-72 shrink-0 flex-col gap-2 rounded-md border p-2"
				>
					<div className="flex items-center justify-between border-b pb-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-5 w-7" />
					</div>
					{Array.from({ length: 3 }).map((_, index) => (
						<Skeleton
							key={index}
							className="h-28 w-full"
						/>
					))}
				</div>
			))}
		</div>
	);
}
