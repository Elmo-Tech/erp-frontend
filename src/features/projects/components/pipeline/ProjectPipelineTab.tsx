"use client";

import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { format, isBefore, parseISO, startOfToday } from "date-fns";
import { CalendarDays, Clock3, Flag, GripVertical, Loader2, MoreHorizontal, Pencil, Play, Plus, Settings2, Square, Trash2, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormCombobox } from "@/components/shared/forms";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { useResumeTimer, useStartTimer, useStopTimer } from "@/features/sales/hooks";
import { TrackableType } from "@/features/sales/types";
import { useAuthStore } from "@/store/authStore";
import { useTimerStore } from "@/store/timerStore";
import { useProjects } from "../../hooks/useProjects";
import { useDeletePipelineTask, useMovePipelineTask, useProjectPipeline } from "../../hooks/useProjectPipeline";
import type { PipelineTask, ProjectWorkflowStage } from "../../types/pipeline";
import { PipelineTaskDialog } from "./PipelineTaskDialog";
import { WorkflowSettingsDialog } from "./WorkflowSettingsDialog";

const priorityClasses: Record<PipelineTask["priority"], string> = {
	low: "text-slate-600 dark:text-slate-300",
	medium: "text-blue-600 dark:text-blue-300",
	high: "text-amber-700 dark:text-amber-300",
	urgent: "text-red-600 dark:text-red-300",
};

interface DraggableTaskCardProps {
	task: PipelineTask;
	dragDisabled: boolean;
	timerState: PipelineTimerState;
	actions: PipelineTaskCardActions;
}

interface PipelineTimerState {
	activeTaskId: number | null;
	resumableTaskId: number | null;
	hasActiveTimer: boolean;
	hasResumableTimer: boolean;
	isPending: boolean;
}

interface PipelineTaskCardActions {
	canEdit: boolean;
	canDelete: boolean;
	canStartTimer: boolean;
	onEdit: () => void;
	onDelete: () => void;
	onStartTimer: () => void;
	onResumeTimer: () => void;
	onStopTimer: () => void;
}

function DraggableTaskCard({ task, dragDisabled, timerState, actions }: DraggableTaskCardProps) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: `pipeline-task-${task.taskId}`,
		data: { taskId: task.taskId, stageId: task.workflowStageId },
		disabled: dragDisabled,
	});
	const dueDate = task.dueDate ? parseISO(task.dueDate) : null;
	const isOverdue = dueDate ? isBefore(dueDate, startOfToday()) : false;
	const isTimerRunning = timerState.activeTaskId === task.taskId;
	const isTimerResumable = timerState.resumableTaskId === task.taskId;
	const isAnotherTimerPending =
		(timerState.hasActiveTimer && !isTimerRunning)
		|| (timerState.hasResumableTimer && !isTimerResumable);
	const timerActionLabel = isTimerRunning
		? `End timer for ${task.title}`
		: isTimerResumable
			? `Resume timer for ${task.title}`
			: `Start timer for ${task.title}`;

	return (
		<article
			ref={setNodeRef}
			style={{
				transform: CSS.Translate.toString(transform),
				willChange: isDragging ? "transform" : undefined,
			}}
			className={cn(
				"group overflow-hidden rounded-lg border bg-card p-3 shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-foreground/20 hover:shadow-md",
				isDragging && "z-20 rotate-1 opacity-60 shadow-lg"
			)}
		>
			{task.coverImageUrl && (
				<div
					aria-hidden="true"
					className="-mx-3 -mt-3 mb-3 aspect-[16/8] bg-cover bg-center transition-transform duration-200 group-hover:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
					style={{ backgroundImage: `url(${JSON.stringify(task.coverImageUrl)})` }}
				/>
			)}
			<div className="flex items-start gap-1">
				<button
					type="button"
					className={cn(
						"-ml-1 mt-0.5 rounded p-1 text-muted-foreground opacity-40 transition hover:bg-muted hover:opacity-100 focus-visible:opacity-100",
						!dragDisabled && "cursor-grab active:cursor-grabbing",
						dragDisabled && "cursor-default"
					)}
					aria-label={`Drag ${task.title}`}
					disabled={dragDisabled}
					{...listeners}
					{...attributes}
				>
					<GripVertical className="h-4 w-4" />
				</button>
				<button
					type="button"
					className={cn(
						"min-w-0 flex-1 text-left text-sm font-semibold leading-5 text-foreground",
						actions.canEdit && "rounded-sm hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					)}
					onClick={actions.canEdit ? actions.onEdit : undefined}
					disabled={!actions.canEdit}
				>
					{task.title}
				</button>
				{(actions.canEdit || actions.canDelete) && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="-mr-1 -mt-1 h-7 w-7 shrink-0 opacity-60 transition-opacity hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:data-[state=open]:opacity-100"
								aria-label={`Actions for ${task.title}`}
							>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-40">
							{actions.canEdit && (
								<DropdownMenuItem onSelect={actions.onEdit}>
									<Pencil />
									Edit task
								</DropdownMenuItem>
							)}
							{actions.canEdit && actions.canDelete && <DropdownMenuSeparator />}
							{actions.canDelete && (
								<DropdownMenuItem variant="destructive" onSelect={actions.onDelete}>
									<Trash2 />
									Delete task
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			{task.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{task.description}</p>}

			<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
				<span className={cn("flex items-center gap-1 font-medium capitalize", priorityClasses[task.priority])}>
					<Flag className="h-3.5 w-3.5" />
					{task.priority}
				</span>
				{task.estimatedHours != null && (
					<span className="flex items-center gap-1 text-muted-foreground">
						<Clock3 className="h-3.5 w-3.5" />
						{task.estimatedHours}h
					</span>
				)}
				{dueDate && (
					<span className={cn("flex items-center gap-1 font-medium", isOverdue ? "text-destructive" : "text-muted-foreground")}>
						<CalendarDays className="h-3.5 w-3.5" />
						{format(dueDate, "MMM d")}
					</span>
				)}
			</div>

			<div className="mt-3 flex min-h-7 items-center justify-between border-t pt-2.5">
				{task.assignees.length > 0 ? (
					<div className="flex min-w-0 items-center gap-2">
						<div className="flex -space-x-1.5">
							{task.assignees.slice(0, 3).map((assignee) => (
								<Avatar key={assignee.userId} className="h-6 w-6 border-2 border-card">
									<AvatarImage src={assignee.avatar} alt={assignee.name} />
									<AvatarFallback className="text-[8px]">{assignee.name.slice(0, 2).toUpperCase()}</AvatarFallback>
								</Avatar>
							))}
							{task.assignees.length > 3 && (
								<span className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-semibold">
									+{task.assignees.length - 3}
								</span>
							)}
						</div>
						<span className="truncate text-xs text-muted-foreground">
							{task.assignees.length === 1 ? task.assignees[0].name : `${task.assignees.length} assignees`}
						</span>
					</div>
				) : (
					<span className="flex items-center gap-1 text-xs text-muted-foreground">
						<UsersRound className="h-3.5 w-3.5" />
						Unassigned
					</span>
				)}
				<div className="flex shrink-0 items-center gap-1">
					{(actions.canStartTimer || isTimerRunning || isTimerResumable) && (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className={cn(
								"h-7 w-7",
								isTimerRunning && "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 hover:text-emerald-800 dark:text-emerald-300"
							)}
							onClick={isTimerRunning ? actions.onStopTimer : isTimerResumable ? actions.onResumeTimer : actions.onStartTimer}
							disabled={timerState.isPending || isAnotherTimerPending}
							aria-label={timerActionLabel}
							title={isTimerRunning ? "End timer" : isTimerResumable ? "Resume timer" : isAnotherTimerPending ? "Finish your current timer first" : "Start timer"}
						>
							{timerState.isPending ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							) : isTimerRunning ? (
								<Square className="h-3.5 w-3.5 fill-current" />
							) : (
								<Play className="h-3.5 w-3.5 fill-current" />
							)}
						</Button>
					)}
					<span className="text-[10px] font-medium text-muted-foreground">#{task.taskId}</span>
				</div>
			</div>
		</article>
	);
}

interface PipelineCapabilities {
	canMove: boolean;
	canCreate: boolean;
	canEdit: boolean;
	canDelete: boolean;
	canStartTimer: boolean;
	currentUserId?: number;
}

interface PipelineColumnActions {
	onCreate: () => void;
	onEdit: (task: PipelineTask) => void;
	onDelete: (task: PipelineTask) => void;
	onStartTimer: (task: PipelineTask) => void;
	onResumeTimer: () => void;
	onStopTimer: () => void;
}

interface PipelineColumnProps {
	stage: ProjectWorkflowStage;
	capabilities: PipelineCapabilities;
	timerState: PipelineTimerState;
	actions: PipelineColumnActions;
}

function PipelineColumn({ stage, capabilities, timerState, actions }: PipelineColumnProps) {
	const { setNodeRef, isOver } = useDroppable({ id: `pipeline-stage-${stage.stageId}`, data: { stageId: stage.stageId } });

	return (
		<section ref={setNodeRef} className={cn("w-[306px] shrink-0 rounded-xl bg-muted/40 p-2.5 transition-colors", isOver && "bg-primary/10 ring-2 ring-primary/20")}>
			<header className="mb-2 flex h-10 items-center justify-between px-1">
				<div className="flex items-center gap-2">
					<span className="h-2.5 w-2.5 rounded-full shadow-xs" style={{ backgroundColor: stage.color }} />
					<h3 className="text-sm font-semibold">{stage.name}</h3>
					<span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-semibold text-muted-foreground shadow-xs">{stage.tasks.length}</span>
				</div>
				{capabilities.canCreate && <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={`Add task to ${stage.name}`} onClick={actions.onCreate}><Plus className="h-4 w-4" /></Button>}
			</header>
			<div className="min-h-24 space-y-2.5">
				{stage.tasks.map((task) => {
					const isAssignedToCurrentUser = task.assignees.some((assignee) => assignee.userId === capabilities.currentUserId);
					return (
						<DraggableTaskCard
							key={task.taskId}
							task={task}
							dragDisabled={!capabilities.canMove}
							timerState={timerState}
							actions={{
								canEdit: capabilities.canEdit,
								canDelete: capabilities.canDelete,
								canStartTimer: capabilities.canStartTimer && isAssignedToCurrentUser && !stage.isTerminal,
								onEdit: () => actions.onEdit(task),
								onDelete: () => actions.onDelete(task),
								onStartTimer: () => actions.onStartTimer(task),
								onResumeTimer: actions.onResumeTimer,
								onStopTimer: actions.onStopTimer,
							}}
						/>
					);
				})}
				{stage.tasks.length === 0 && <div className="rounded-lg border border-dashed bg-background/35 p-6 text-center text-xs text-muted-foreground">Drop a task here</div>}
				{capabilities.canCreate && (
					<Button type="button" variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={actions.onCreate}>
						<Plus className="mr-2 h-4 w-4" />
						Add task
					</Button>
				)}
			</div>
		</section>
	);
}

export function ProjectPipelineTab({ projectId }: { projectId: number }) {
	const router = useRouter();
	const pipeline = useProjectPipeline(projectId);
	const projects = useProjects({ perPage: 100 });
	const moveTask = useMovePipelineTask(projectId);
	const deleteTask = useDeletePipelineTask(projectId);
	const startTimer = useStartTimer();
	const resumeTimer = useResumeTimer();
	const stopTimer = useStopTimer();
	const permissions = usePermissions();
	const currentUserId = useAuthStore((state) => state.user?.userId);
	const activeTimer = useTimerStore((state) => state.activeTimer);
	const resumableTimer = useTimerStore((state) => state.resumableTimer);
	const [projectSearch, setProjectSearch] = useState("");
	const [taskDialog, setTaskDialog] = useState<{ stage: ProjectWorkflowStage; task?: PipelineTask } | null>(null);
	const [taskToDelete, setTaskToDelete] = useState<PipelineTask | null>(null);
	const [workflowOpen, setWorkflowOpen] = useState(false);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

	const canCreate = permissions.canCreateMainTasks || permissions.canManageTasks;
	const canMove = permissions.canEditMainTasks || permissions.canManageTasks;
	const canEdit = permissions.canEditMainTasks || permissions.canManageTasks;
	const canDelete = permissions.canDeleteTasks || permissions.canManageTasks;
	const activeTaskId = activeTimer?.trackableType.toLowerCase().includes("task")
		? Number(activeTimer.trackableId)
		: null;
	const resumableTaskId = resumableTimer?.trackableType.toLowerCase().includes("task")
		? Number(resumableTimer.trackableId)
		: null;
	const timerState: PipelineTimerState = {
		activeTaskId,
		resumableTaskId,
		hasActiveTimer: Boolean(activeTimer),
		hasResumableTimer: Boolean(resumableTimer),
		isPending: startTimer.isPending || resumeTimer.isPending || stopTimer.isPending,
	};
	const capabilities: PipelineCapabilities = {
		canMove: canMove && !moveTask.isPending,
		canCreate,
		canEdit,
		canDelete,
		canStartTimer: permissions.canStartTimer,
		currentUserId,
	};
	const projectOptions = useMemo(() => {
		const search = projectSearch.trim().toLowerCase();
		return (projects.data?.projects ?? [])
			.filter((item) => !search || item.title.toLowerCase().includes(search))
			.map((item) => ({ value: String(item.projectId), label: item.title }));
	}, [projectSearch, projects.data]);

	const handleDragEnd = async ({ active, over }: DragEndEvent) => {
		if (!over) return;
		const taskId = Number(active.data.current?.taskId);
		const currentStageId = Number(active.data.current?.stageId);
		const nextStageId = Number(over.data.current?.stageId);
		if (!taskId || !nextStageId || currentStageId === nextStageId) return;

		try {
			await moveTask.mutateAsync({ taskId, workflowStageId: nextStageId });
			toast.success("Task moved");
		} catch {
			toast.error("Could not move the task");
		}
	};

	const handleDelete = async () => {
		if (!taskToDelete) return;

		try {
			await deleteTask.mutateAsync(taskToDelete.taskId);
			toast.success("Task moved to trash");
			setTaskToDelete(null);
		} catch {
			toast.error("Could not delete the task");
		}
	};

	const handleStartTimer = async (task: PipelineTask) => {
		try {
			await startTimer.mutateAsync({
				trackableType: TrackableType.TASK,
				trackableId: task.taskId,
			});
			await pipeline.refetch();
			toast.success(`Timer started for “${task.title}”`);
		} catch {
			toast.error("Could not start the timer");
		}
	};

	const handleStopTimer = async () => {
		try {
			await stopTimer.mutateAsync();
			toast.success("Timer ended");
		} catch {
			toast.error("Could not end the timer");
		}
	};

	const handleResumeTimer = async () => {
		if (!resumableTimer) return;

		try {
			await resumeTimer.mutateAsync(resumableTimer.timeEntryId);
			await pipeline.refetch();
			toast.success("Timer resumed");
		} catch {
			toast.error("Could not resume the timer");
		}
	};

	if (pipeline.isLoading) {
		return <div className="flex gap-4 overflow-hidden">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-80 w-[290px] shrink-0" />)}</div>;
	}

	if (pipeline.isError || !pipeline.data) {
		return <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">The project pipeline could not be loaded.</div>;
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="w-full md:w-80">
					<FormCombobox
						id="pipeline-project-switcher"
						label="Switch project"
						value={String(projectId)}
						options={projectOptions}
						onValueChange={(value) => router.push(`/dashboard/projects/${value}`)}
						searchValue={projectSearch}
						onSearchChange={setProjectSearch}
						placeholder="Choose a project"
						searchPlaceholder="Search accessible projects..."
						isLoading={projects.isLoading}
					/>
				</div>
				{permissions.canManageProjectWorkflows && (
					<Button type="button" variant="outline" onClick={() => setWorkflowOpen(true)}>
						<Settings2 className="mr-2 h-4 w-4" />
						Workflow settings
					</Button>
				)}
			</div>

			<div className="flex flex-col gap-1 border-b pb-3">
				<h2 className="text-sm font-semibold">Project board</h2>
				<p className="text-xs text-muted-foreground">Drag tasks between statuses, or use the task menu to edit details and assignees.</p>
			</div>

			<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
				<div className="flex gap-3 overflow-x-auto pb-4">
					{pipeline.data.stages.map((stage) => (
						<PipelineColumn
							key={stage.stageId}
							stage={stage}
							capabilities={capabilities}
							timerState={timerState}
							actions={{
								onCreate: () => setTaskDialog({ stage }),
								onEdit: (task) => setTaskDialog({ stage, task }),
								onDelete: setTaskToDelete,
								onStartTimer: handleStartTimer,
								onResumeTimer: handleResumeTimer,
								onStopTimer: handleStopTimer,
							}}
						/>
					))}
				</div>
			</DndContext>

			{taskDialog && (
				<PipelineTaskDialog
					projectId={projectId}
					stage={taskDialog.stage}
					stages={pipeline.data.stages}
					task={taskDialog.task}
					open
					onOpenChange={(open) => !open && setTaskDialog(null)}
				/>
			)}

			<AlertDialog open={Boolean(taskToDelete)} onOpenChange={(open) => !open && setTaskToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete “{taskToDelete?.title}”?</AlertDialogTitle>
						<AlertDialogDescription>
							The task will be removed from this board. Its existing time entries and audit data are kept for recovery.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteTask.isPending}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(event) => {
								event.preventDefault();
								void handleDelete();
							}}
							disabled={deleteTask.isPending}
							className="bg-destructive text-white hover:bg-destructive/90"
						>
							{deleteTask.isPending ? "Deleting..." : "Delete task"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{permissions.canManageProjectWorkflows && workflowOpen && (
				<WorkflowSettingsDialog
					projectId={projectId}
					stages={pipeline.data.stages}
					canManageTemplates={permissions.canManageWorkflowTemplates}
					open
					onOpenChange={setWorkflowOpen}
				/>
			)}
		</div>
	);
}
