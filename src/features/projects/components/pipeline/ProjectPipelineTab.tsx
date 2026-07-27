"use client";

import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Clock3, GripVertical, Plus, Settings2, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormCombobox } from "@/components/shared/forms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { useProjects } from "../../hooks/useProjects";
import { useMovePipelineTask, useProjectPipeline } from "../../hooks/useProjectPipeline";
import type { PipelineTask, ProjectWorkflowStage } from "../../types/pipeline";
import { PipelineTaskDialog } from "./PipelineTaskDialog";
import { WorkflowSettingsDialog } from "./WorkflowSettingsDialog";

const priorityClasses: Record<PipelineTask["priority"], string> = {
	low: "bg-slate-100 text-slate-700",
	medium: "bg-blue-100 text-blue-700",
	high: "bg-amber-100 text-amber-800",
	urgent: "bg-red-100 text-red-700",
};

function DraggableTaskCard({ task, disabled }: { task: PipelineTask; disabled: boolean }) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: `pipeline-task-${task.taskId}`,
		data: { taskId: task.taskId, stageId: task.workflowStageId },
		disabled,
	});

	return (
		<Card
			ref={setNodeRef}
			style={{ transform: CSS.Translate.toString(transform) }}
			className={cn("cursor-default shadow-sm", !disabled && "cursor-grab active:cursor-grabbing", isDragging && "z-20 opacity-60")}
			{...listeners}
			{...attributes}
		>
			<CardContent className="space-y-3 p-3">
				<div className="flex items-start gap-2">
					<GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
					<p className="min-w-0 flex-1 text-sm font-medium leading-5">{task.title}</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Badge className={cn("border-0 capitalize", priorityClasses[task.priority])}>{task.priority}</Badge>
					{task.estimatedHours != null && <Badge variant="outline"><Clock3 className="mr-1 h-3 w-3" />{task.estimatedHours}h</Badge>}
				</div>
				{task.assignees.length > 0 && (
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<div className="flex -space-x-1.5">
							{task.assignees.slice(0, 3).map((assignee) => (
								<Avatar key={assignee.userId} className="h-6 w-6 border-2 border-card">
									<AvatarImage src={assignee.avatar} alt="" />
									<AvatarFallback className="text-[8px]">{assignee.name.slice(0, 2).toUpperCase()}</AvatarFallback>
								</Avatar>
							))}
						</div>
						<span className="flex min-w-0 items-center gap-1">
							<UsersRound className="h-3 w-3 shrink-0" />
							<span className="truncate">
								{task.assignees.length === 1
									? task.assignees[0].name
									: `${task.assignees.length} employees`}
							</span>
						</span>
					</div>
				)}
				{task.dueDate && <p className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{task.dueDate}</p>}
			</CardContent>
		</Card>
	);
}

function PipelineColumn({ stage, canMove, canCreate, onCreate }: { stage: ProjectWorkflowStage; canMove: boolean; canCreate: boolean; onCreate: () => void }) {
	const { setNodeRef, isOver } = useDroppable({ id: `pipeline-stage-${stage.stageId}`, data: { stageId: stage.stageId } });

	return (
		<section ref={setNodeRef} className={cn("w-[290px] shrink-0 rounded-lg bg-muted/45 p-3 transition-colors", isOver && "bg-primary/10")}>
			<header className="mb-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
					<h3 className="text-sm font-semibold">{stage.name}</h3>
					<Badge variant="secondary">{stage.tasks.length}</Badge>
				</div>
				{canCreate && <Button type="button" variant="ghost" size="icon" aria-label={`Add task to ${stage.name}`} onClick={onCreate}><Plus className="h-4 w-4" /></Button>}
			</header>
			<div className="min-h-24 space-y-3">
				{stage.tasks.map((task) => <DraggableTaskCard key={task.taskId} task={task} disabled={!canMove} />)}
				{stage.tasks.length === 0 && <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">Drop a task here</div>}
			</div>
		</section>
	);
}

export function ProjectPipelineTab({ projectId }: { projectId: number }) {
	const router = useRouter();
	const pipeline = useProjectPipeline(projectId);
	const projects = useProjects({ perPage: 100 });
	const moveTask = useMovePipelineTask(projectId);
	const permissions = usePermissions();
	const [projectSearch, setProjectSearch] = useState("");
	const [taskStage, setTaskStage] = useState<ProjectWorkflowStage | null>(null);
	const [workflowOpen, setWorkflowOpen] = useState(false);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

	const canCreate = permissions.canCreateMainTasks || permissions.canManageTasks;
	const canMove = permissions.canEditMainTasks || permissions.canManageTasks;
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

			<p className="text-sm text-muted-foreground">A focused delivery board for flat tasks. Assigning an employee to a task automatically gives them access to this project.</p>

			<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
				<div className="flex gap-4 overflow-x-auto pb-4">
					{pipeline.data.stages.map((stage) => (
						<PipelineColumn
							key={stage.stageId}
							stage={stage}
							canMove={canMove && !moveTask.isPending}
							canCreate={canCreate}
							onCreate={() => setTaskStage(stage)}
						/>
					))}
				</div>
			</DndContext>

			{taskStage && (
				<PipelineTaskDialog
					projectId={projectId}
					stage={taskStage}
					open
					onOpenChange={(open) => !open && setTaskStage(null)}
				/>
			)}

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
