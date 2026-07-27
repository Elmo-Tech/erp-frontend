"use client";

import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { ProjectTaskCard } from "@/features/projects/ui/ProjectTaskCard";
import {
	ExecutionTaskStatus,
	useMoveProjectTask,
	type ProjectTask,
	type ProjectWorkflowStage,
} from "@/features/projects/api/execution.api";
import { cn } from "@/shared/lib/utils";

interface ProjectTasksBoardPermissions {
	canEditTaskMetadata: boolean;
	canDeleteTask: boolean;
}

interface ProjectTasksBoardProps {
	projectId: number;
	stages: ProjectWorkflowStage[];
	tasks: ProjectTask[];
	permissions: ProjectTasksBoardPermissions;
	onTaskClick: (task: ProjectTask) => void;
	onTaskEdit: (task: ProjectTask) => void;
	onTaskDelete: (task: ProjectTask) => void;
}

export function ProjectTasksBoard({
	projectId,
	stages,
	tasks,
	permissions,
	onTaskClick,
	onTaskEdit,
	onTaskDelete,
}: ProjectTasksBoardProps) {
	const moveTask = useMoveProjectTask();
	const tasksByStage = new Map(
		stages.map((stage) => [
			stage.stageId,
			tasks
				.filter((task) => task.workflowStageId === stage.stageId)
				.sort((left, right) => (left.pipelinePosition ?? 0) - (right.pipelinePosition ?? 0)),
		]),
	);

	const onDragEnd = async ({ destination, draggableId, source }: DropResult) => {
		if (!destination) return;
		if (destination.droppableId === source.droppableId && destination.index === source.index) return;

		const task = tasks.find((candidate) => candidate.taskId === Number(draggableId));
		const targetStage = stages.find((stage) => stage.stageId === Number(destination.droppableId));
		if (!task || !targetStage || !canMoveToStage(task, targetStage)) {
			toast.error("You do not have permission to move this task to that stage.");
			return;
		}

		try {
			await moveTask.mutateAsync({
				projectId,
				taskId: task.taskId,
				workflowStageId: targetStage.stageId,
				position: destination.index,
			});
		} catch {
			toast.error("Task could not be moved. The board has been refreshed.");
		}
	};

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className="flex min-h-[520px] gap-4 overflow-x-auto pb-4">
				{stages.map((stage) => (
					<PipelineColumn
						key={stage.stageId}
						stage={stage}
						tasks={tasksByStage.get(stage.stageId) ?? []}
						projectId={projectId}
						permissions={permissions}
						onTaskClick={onTaskClick}
						onTaskEdit={onTaskEdit}
						onTaskDelete={onTaskDelete}
					/>
				))}
			</div>
		</DragDropContext>
	);
}

function PipelineColumn({
	stage,
	tasks,
	projectId,
	permissions,
	onTaskClick,
	onTaskEdit,
	onTaskDelete,
}: Omit<ProjectTasksBoardProps, "stages"> & { stage: ProjectWorkflowStage }) {
	return (
		<section className="w-[310px] shrink-0">
			<header className="mb-2.5 flex items-center justify-between px-1">
				<div className="flex min-w-0 items-center gap-2">
					<span
						className="size-2.5 shrink-0 rounded-full"
						style={{ backgroundColor: stage.color }}
					/>
					<h3 className="truncate text-sm font-semibold">{stage.name}</h3>
				</div>
				<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
					{tasks.length}
				</span>
			</header>

			<Droppable droppableId={String(stage.stageId)}>
				{(provided, snapshot) => (
					<div
						ref={provided.innerRef}
						{...provided.droppableProps}
						className={cn(
							"min-h-[460px] space-y-3 rounded-2xl border border-border/70 bg-muted/25 p-2.5 transition-colors",
							snapshot.isDraggingOver && "border-primary/40 bg-primary/5 ring-1 ring-primary/15",
						)}
					>
						{tasks.map((task, index) => (
							<Draggable
								key={task.taskId}
								draggableId={String(task.taskId)}
								index={index}
								isDragDisabled={!hasAnyMovePermission(task)}
							>
								{(dragProvided, dragSnapshot) => (
									<div
										ref={dragProvided.innerRef}
										{...dragProvided.draggableProps}
										{...dragProvided.dragHandleProps}
										className={cn(dragSnapshot.isDragging && "rotate-1 opacity-95 shadow-xl")}
									>
										<ProjectTaskCard
											task={task}
											projectId={projectId}
											onClick={onTaskClick}
											canEdit={permissions.canEditTaskMetadata}
											canDelete={permissions.canDeleteTask}
											onEdit={onTaskEdit}
											onDelete={onTaskDelete}
										/>
									</div>
								)}
							</Draggable>
						))}
						{provided.placeholder}
						{tasks.length === 0 && !snapshot.isDraggingOver && (
							<div className="flex h-24 items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground/70">
								Drop a task here
							</div>
						)}
					</div>
				)}
			</Droppable>
		</section>
	);
}

function hasAnyMovePermission(task: ProjectTask): boolean {
	return Boolean(task.allowedActions?.changeStatus || task.allowedActions?.complete || task.allowedActions?.reopen);
}

function canMoveToStage(task: ProjectTask, stage: ProjectWorkflowStage): boolean {
	if (stage.status === ExecutionTaskStatus.DONE) return Boolean(task.allowedActions?.complete);
	if (task.status === ExecutionTaskStatus.DONE) return Boolean(task.allowedActions?.reopen);

	return Boolean(task.allowedActions?.changeStatus);
}
