"use client";

import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, closestCorners, useSensor, useSensors } from "@dnd-kit/core";
import { useQuery } from "@tanstack/react-query";
import { ListTodo, Plus } from "lucide-react";
import { toast } from "sonner";
import { taskApi } from "@/entities/task/api/task.api";
import { taskKeys } from "@/entities/task/model/query-keys";
import { Task, TaskPriority, TaskPriorityLabels, TaskStatus, TaskStatusLabels } from "@/entities/task/model/types";
import { TaskCard } from "@/entities/task/ui/TaskCard";
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

interface ProjectTasksKanbanWidgetProps {
	projectId: number;
	projectTitle?: string;
	className?: string;
}

const KANBAN_STATUSES = Object.values(TaskStatus);
const DEFAULT_PER_PAGE = 100;
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

export function ProjectTasksKanbanWidget({ projectId, projectTitle, className }: ProjectTasksKanbanWidgetProps) {
	const [search, setSearch] = useState("");
	const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [activeTask, setActiveTask] = useState<Task | null>(null);
	const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
	const { canCreateTasks, canCreateMainTasks, canDeleteTasks, canEditTasks } = useTaskPermissions();
	const updateTask = useUpdateTask();
	const deleteTask = useDeleteTask();
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor));

	const tasksQuery = useQuery({
		queryKey: taskKeys.projectTasks(projectId, 1, DEFAULT_PER_PAGE),
		queryFn: () => taskApi.getProjectTasks(projectId, 1, DEFAULT_PER_PAGE),
		enabled: Boolean(projectId),
		staleTime: 5 * 60 * 1000,
	});

	const allTasks = useMemo(() => flattenTasks(tasksQuery.data?.tasks ?? []), [tasksQuery.data?.tasks]);
	const filteredTasks = useMemo(() => {
		const normalizedSearch = search.trim().toLowerCase();

		return allTasks.filter((task) => {
			if (normalizedSearch && !task.title.toLowerCase().includes(normalizedSearch)) {
				return false;
			}

			if (priorityFilter && task.priority !== priorityFilter) {
				return false;
			}

			return true;
		});
	}, [allTasks, priorityFilter, search]);
	const tasksByStatus = useMemo(() => groupTasksByStatus(filteredTasks), [filteredTasks]);

	const handleDragStart = (event: DragStartEvent) => {
		const payload = event.active.data.current;
		if (!isTaskDragPayload(payload)) {
			return;
		}

		setActiveTask(allTasks.find((task) => task.taskId === payload.taskId) ?? null);
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

	const handleDragEnd = async (event: DragEndEvent) => {
		const activePayload = event.active.data.current;
		const overPayload = event.over?.data.current;
		setActiveTask(null);

		if (!isTaskDragPayload(activePayload) || !isTaskStatusDropPayload(overPayload)) {
			return;
		}

		const task = allTasks.find((item) => item.taskId === activePayload.taskId);
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
			await deleteTask.mutateAsync({ id: taskToDelete.taskId, projectId });
			toast.success("Task deleted");
			setTaskToDelete(null);
		} catch {
			toast.error("Failed to delete task");
		}
	};

	return (
		<section className={cn("flex flex-col gap-4", className)}>
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h2 className="text-lg font-semibold tracking-tight">Tasks</h2>
					<p className="text-sm text-muted-foreground">{tasksQuery.data?.pagination ? `${tasksQuery.data.pagination.total} tasks in this project` : "Project task board"}</p>
				</div>

				{(canCreateTasks || canCreateMainTasks) && (
					<Button
						size="sm"
						onClick={() => setCreateDialogOpen(true)}
					>
						<Plus data-icon="inline-start" />
						New task
					</Button>
				)}
			</div>

			<div className="flex flex-col gap-3 border-y py-3 md:flex-row md:items-center md:justify-between">
				<SearchInput
					value={search}
					onChange={setSearch}
					placeholder="Search tasks"
					className="w-full md:max-w-sm"
					autoSearch={false}
				/>
				<FilterSelect
					value={priorityFilter}
					onChange={(priority) => setPriorityFilter(priority as TaskPriority | undefined)}
					options={PRIORITY_OPTIONS}
					placeholder="Priority"
					allLabel="All priorities"
					className="w-full md:w-44"
				/>
			</div>

			{tasksQuery.isLoading ? (
				<KanbanSkeleton />
			) : tasksQuery.error ? (
				<div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-md border px-4 text-center">
					<ListTodo className="size-6 text-muted-foreground" />
					<div className="text-sm font-medium">Unable to load tasks</div>
					<div className="text-sm text-muted-foreground">{tasksQuery.error.message}</div>
				</div>
			) : (
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
			)}

			<CreateTaskForm
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				projectId={projectId}
				projectTitle={projectTitle}
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
