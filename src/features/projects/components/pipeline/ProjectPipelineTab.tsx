"use client";

import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, KeyboardSensor, closestCenter, pointerWithin, type CollisionDetection, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { format, isBefore, parseISO, startOfToday } from "date-fns";
import { BarChart3, CalendarDays, Clock3, Columns3, Flag, GripVertical, List, MoreHorizontal, Pencil, Plus, Trash2, UserRoundCheck, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { notifyApiError } from "@/lib/errorHandling";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { useAuthStore } from "@/store/authStore";
import { TaskWorkControls } from "../tasks/TaskWorkControls";
import { TaskDetailSheet } from "../tasks/TaskDetailSheet";
import { useProjects } from "../../hooks/useProjects";
import { useDeletePipelineTask, useMovePipelineTask, useProjectPipeline } from "../../hooks/useProjectPipeline";
import type { PipelineTask, ProjectWorkflowStage } from "../../types/pipeline";
import { resolvePipelineDrop } from "./pipelineDrop";
import { PipelineTaskDialog } from "./PipelineTaskDialog";
import { ProjectTaskDashboard, ProjectTaskList } from "./ProjectTaskViews";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const priorityClasses: Record<PipelineTask["priority"], string> = {
	low: "text-slate-600 dark:text-slate-300",
	medium: "text-blue-600 dark:text-blue-300",
	high: "text-amber-700 dark:text-amber-300",
	urgent: "text-red-600 dark:text-red-300",
};

const pipelineCollisionDetection: CollisionDetection = (args) => {
	const hits = pointerWithin(args);
	if (hits.length) {
		const cards = hits.filter((hit) => String(hit.id).startsWith("pipeline-task-"));
		return cards.length ? cards : hits;
	}
	return closestCenter(args);
};

interface DraggableTaskCardProps {
	task: PipelineTask;
	dragDisabled: boolean;
	stage: ProjectWorkflowStage;
	actions: PipelineTaskCardActions;
}

interface PipelineTaskCardActions {
	canEdit: boolean;
	canDelete: boolean;
	canStartTimer: boolean;
	onOpen: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

export function DraggableTaskCard({ task, dragDisabled, stage, actions }: DraggableTaskCardProps) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
		id: `pipeline-task-${task.taskId}`,
		data: { taskId: task.taskId, stageId: task.workflowStageId },
		disabled: dragDisabled,
	});
	const dueDate = task.dueDate ? parseISO(task.dueDate) : null;
	const isOverdue = !stage.isTerminal && dueDate ? isBefore(dueDate, startOfToday()) : false;
	const minutes = task.totalTimeSpent ?? 0;
	const loggedTime = minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
	const assigneeNames = task.assignees.map((assignee) => assignee.name).join(", ");

	return (
		<article
			ref={setNodeRef}
			style={{
				transform: CSS.Transform.toString(transform),
				willChange: isDragging ? "transform" : undefined,
			}}
			className={cn(
				"group relative isolate overflow-hidden rounded-lg border bg-card p-3 shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-foreground/20 hover:shadow-md",
				isDragging && "z-20 rotate-1 opacity-60 shadow-lg"
			)}
		>
			<button
				type="button"
				className="absolute inset-0 z-10 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
				aria-label={`Open task details: ${task.title}`}
				onClick={actions.onOpen}
			/>
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
						"relative z-20 -ml-1 mt-0.5 touch-none rounded p-1 text-muted-foreground opacity-40 transition hover:bg-muted hover:opacity-100 focus-visible:opacity-100",
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
				<h3 className="min-w-0 flex-1 text-sm font-semibold leading-5" style={{ color: stage.color || "#64748b" }}>
					{task.title}
				</h3>
				{(actions.canEdit || actions.canDelete) && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="relative z-20 -mr-1 -mt-1 h-7 w-7 shrink-0"
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
			<div className="mt-2 flex items-center justify-between gap-2">
				<Badge variant="outline" className="text-[10px]" style={{ borderColor: stage.color }}>{stage.name}</Badge>
				<span className="text-[10px] text-muted-foreground">#{task.taskId}</span>
			</div>

			<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
				<span className={cn("flex items-center gap-1 font-medium capitalize", priorityClasses[task.priority])}>
					<Flag className="h-3.5 w-3.5" />
					{task.priority}
				</span>
				{(minutes > 0 || task.estimatedHours != null) && (
					<span className="flex items-center gap-1 text-muted-foreground" aria-label={`${loggedTime} logged${task.estimatedHours != null ? ` of ${task.estimatedHours}h estimated` : ""}`}>
						<Clock3 className="h-3.5 w-3.5" />
						{loggedTime}{task.estimatedHours != null && ` / ${task.estimatedHours}h`}
					</span>
				)}
				{dueDate && (
					<span className={cn("flex items-center gap-1 font-medium", isOverdue ? "text-destructive" : "text-muted-foreground")}>
						<CalendarDays className="h-3.5 w-3.5" />
						{format(dueDate, "MMM d")}
					</span>
				)}
			</div>

			<div className="mt-3 space-y-2 border-t pt-2.5">
				<div className="flex min-w-0 items-center gap-2 text-xs" title={assigneeNames || "Unassigned"}>
					<UsersRound className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
					{task.assignees.length > 0 && (
						<div className="flex shrink-0 -space-x-1.5">
							{task.assignees.slice(0, 3).map((assignee) => (
								<Avatar key={assignee.userId} className="h-5 w-5 border border-card">
									<AvatarImage src={assignee.avatar} alt={assignee.name} />
									<AvatarFallback className="text-[8px]">{assignee.name.slice(0, 2).toUpperCase()}</AvatarFallback>
								</Avatar>
							))}
						</div>
					)}
					<span className="min-w-0 truncate">{assigneeNames || "Unassigned"}</span>
				</div>
				<div className="flex min-w-0 items-center gap-2 text-xs">
					<UserRoundCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
					<span className="text-muted-foreground">Supervisor</span>
					<span className="min-w-0 truncate font-medium">{task.supervisors?.map((supervisor) => supervisor.name).join(", ") || task.supervisor?.name || "Not assigned"}</span>
				</div>
				{task.holdReason && <p className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-xs">On hold: {task.holdReason}</p>}
				<div className="relative z-20">
					<TaskWorkControls taskId={task.taskId} title={task.title} canWork={actions.canStartTimer} activeWorkTimers={task.activeWorkTimers} disabledReason={stage.isTerminal ? "This task is closed." : undefined} />
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
	onOpen: (task: PipelineTask) => void;
	onEdit: (task: PipelineTask) => void;
	onDelete: (task: PipelineTask) => void;
}

interface PipelineColumnProps {
	stage: ProjectWorkflowStage;
	capabilities: PipelineCapabilities;
	actions: PipelineColumnActions;
}

function PipelineColumn({ stage, capabilities, actions }: PipelineColumnProps) {
	const { setNodeRef, isOver } = useDroppable({ id: `pipeline-stage-${stage.stageId}`, data: { stageId: stage.stageId } });

	return (
		<section ref={setNodeRef} className={cn("w-[min(340px,85vw)] shrink-0 rounded-2xl border bg-muted/40 p-2.5 transition-colors", isOver && "bg-muted ring-2 ring-muted-foreground/20")}>
			<header className="mb-2 flex h-10 items-center justify-between rounded-xl px-2" style={{ backgroundColor: `color-mix(in oklch, ${stage.color} 12%, transparent)` }}>
				<div className="flex items-center gap-2">
					<span className="h-2.5 w-2.5 rounded-full shadow-xs" style={{ backgroundColor: stage.color }} />
					<h3 className="text-sm font-semibold">{stage.name}</h3>
					<span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-semibold text-muted-foreground shadow-xs">{stage.tasks.length}</span>
				</div>
				{capabilities.canCreate && <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={`Add task to ${stage.name}`} onClick={actions.onCreate}><Plus className="h-4 w-4" /></Button>}
			</header>
			<div className="min-h-24 space-y-2.5">
				<SortableContext items={stage.tasks.map((task) => `pipeline-task-${task.taskId}`)} strategy={verticalListSortingStrategy}>
				{stage.tasks.map((task) => {
					const isAssignedToCurrentUser = task.assignees.some((assignee) => assignee.userId === capabilities.currentUserId);
					return (
						<DraggableTaskCard
							key={task.taskId}
							task={task}
							dragDisabled={!capabilities.canMove}
							stage={stage}
							actions={{
								canEdit: capabilities.canEdit,
								canDelete: capabilities.canDelete,
								canStartTimer: capabilities.canStartTimer && isAssignedToCurrentUser && !stage.isTerminal,
								onOpen: () => actions.onOpen(task),
								onEdit: () => actions.onEdit(task),
								onDelete: () => actions.onDelete(task),
							}}
						/>
					);
				})}
				</SortableContext>
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
	const permissions = usePermissions();
	const currentUserId = useAuthStore((state) => state.user?.userId);
	const [projectSearch, setProjectSearch] = useState("");
	const [taskDialog, setTaskDialog] = useState<{ stage: ProjectWorkflowStage; task?: PipelineTask } | null>(null);
	const [taskToDelete, setTaskToDelete] = useState<PipelineTask | null>(null);
	const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

	const canCreate = permissions.canCreateMainTasks || permissions.canManageTasks;
	const canMove = permissions.canEditMainTasks || permissions.canManageTasks;
	const canEdit = permissions.canEditMainTasks || permissions.canManageTasks;
	const canDelete = permissions.canDeleteTasks || permissions.canManageTasks;
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
		if (!over || !pipeline.data) return;
		const move = resolvePipelineDrop(pipeline.data.stages, active.data.current, over.data.current);
		if (!move) return;
		try {
			await moveTask.mutateAsync(move);
		} catch (error) { notifyApiError(error); }
	};

	const handleDelete = async () => {
		if (!taskToDelete) return;

		try {
			await deleteTask.mutateAsync(taskToDelete.taskId);
			// Success toast comes from the backend message via the axios interceptor.
			setTaskToDelete(null);
		} catch (error) {
			notifyApiError(error);
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
			<Tabs defaultValue="board" className="gap-4">
				<TabsList aria-label="Project views" className="h-auto w-full justify-start gap-1 rounded-none border-b bg-transparent p-0">
					<TabsTrigger value="board" className="h-11 flex-none gap-2 rounded-none border-0 border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"><Columns3 />Board</TabsTrigger>
					<TabsTrigger value="list" className="h-11 flex-none gap-2 rounded-none border-0 border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"><List />List</TabsTrigger>
					<TabsTrigger value="dashboard" className="h-11 flex-none gap-2 rounded-none border-0 border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"><BarChart3 />Dashboard</TabsTrigger>
				</TabsList>
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
			</div>
				<TabsContent value="board"><DndContext sensors={sensors} collisionDetection={pipelineCollisionDetection} onDragEnd={handleDragEnd}>
				<div className="flex gap-3 overflow-x-auto pb-4">
					{pipeline.data.stages.map((stage) => (
						<PipelineColumn
							key={stage.stageId}
							stage={stage}
							capabilities={capabilities}
							actions={{
								onCreate: () => setTaskDialog({ stage }),
								onOpen: (task) => setSelectedTaskId(task.taskId),
								onEdit: (task) => setTaskDialog({ stage, task }),
								onDelete: setTaskToDelete,
							}}
						/>
					))}
				</div>
			</DndContext></TabsContent>
				<TabsContent value="list"><ProjectTaskList stages={pipeline.data.stages} canCreate={canCreate} onOpen={(task) => setSelectedTaskId(task.taskId)} onCreate={(stage) => setTaskDialog({ stage })} /></TabsContent>
				<TabsContent value="dashboard"><ProjectTaskDashboard stages={pipeline.data.stages} /></TabsContent>
			</Tabs>

			{selectedTaskId && (
				<TaskDetailSheet key={selectedTaskId} taskId={selectedTaskId} open onOpenChange={(open) => !open && setSelectedTaskId(null)} onEdit={canEdit ? (task) => {
					const stage = pipeline.data.stages.find((item) => item.tasks.some((entry) => entry.taskId === task.taskId));
					const pipelineTask = stage?.tasks.find((entry) => entry.taskId === task.taskId);
					if (stage && pipelineTask) { setSelectedTaskId(null); setTaskDialog({ stage, task: pipelineTask }); }
				} : undefined} />
			)}

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

		</div>
	);
}
