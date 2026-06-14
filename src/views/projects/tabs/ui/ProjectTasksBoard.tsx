"use client";

import { ChevronDown, ChevronRight, Inbox } from "lucide-react";
import { MilestoneSwimlane } from "@/features/projects/ui/MilestoneSwimlane";
import { ProjectTaskCard } from "@/features/projects/ui/ProjectTaskCard";
import type { Milestone, ProjectTask } from "@/features/projects/api/execution.api";

interface ProjectTasksBoardPermissions {
	canEditTaskMetadata: boolean;
	canDeleteTask: boolean;
}

interface ProjectTasksBoardProps {
	projectId: number;
	milestones: Milestone[];
	tasksByMilestone: Map<number, ProjectTask[]>;
	backlogTasks: ProjectTask[];
	collapsedSections: Record<string, boolean>;
	permissions: ProjectTasksBoardPermissions;
	onTaskClick: (task: ProjectTask) => void;
	onTaskEdit: (task: ProjectTask) => void;
	onTaskDelete: (task: ProjectTask) => void;
	onToggleSection: (sectionKey: string) => void;
}

export function ProjectTasksBoard({
	projectId,
	milestones,
	tasksByMilestone,
	backlogTasks,
	collapsedSections,
	permissions,
	onTaskClick,
	onTaskEdit,
	onTaskDelete,
	onToggleSection,
}: ProjectTasksBoardProps) {
	return (
		<div className="flex flex-col gap-5">
			{milestones.map((milestone) => {
				const sectionKey = `milestone-${milestone.milestoneId}`;

				return (
					<MilestoneSwimlane
						key={milestone.milestoneId}
						milestone={milestone}
						tasks={tasksByMilestone.get(milestone.milestoneId) ?? []}
						projectId={projectId}
						onTaskClick={onTaskClick}
						canEditTasks={permissions.canEditTaskMetadata}
						canDeleteTasks={permissions.canDeleteTask}
						onTaskEdit={onTaskEdit}
						onTaskDelete={onTaskDelete}
						isCollapsed={collapsedSections[sectionKey] ?? false}
						onToggleCollapse={() => onToggleSection(sectionKey)}
					/>
				);
			})}

			<BacklogSection
				projectId={projectId}
				tasks={backlogTasks}
				isCollapsed={collapsedSections.backlog ?? false}
				permissions={permissions}
				onTaskClick={onTaskClick}
				onTaskEdit={onTaskEdit}
				onTaskDelete={onTaskDelete}
				onToggle={() => onToggleSection("backlog")}
			/>
		</div>
	);
}

interface BacklogSectionProps {
	projectId: number;
	tasks: ProjectTask[];
	isCollapsed: boolean;
	permissions: ProjectTasksBoardPermissions;
	onTaskClick: (task: ProjectTask) => void;
	onTaskEdit: (task: ProjectTask) => void;
	onTaskDelete: (task: ProjectTask) => void;
	onToggle: () => void;
}

function BacklogSection({ projectId, tasks, isCollapsed, permissions, onTaskClick, onTaskEdit, onTaskDelete, onToggle }: BacklogSectionProps) {
	if (tasks.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-col gap-3 rounded-lg border border-dashed bg-muted/10 p-4">
			<div className="flex items-center gap-2">
				<button
					type="button"
					className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
					onClick={onToggle}
					aria-label={isCollapsed ? "Expand backlog" : "Collapse backlog"}
				>
					{isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
				</button>
				<Inbox className="size-4 text-muted-foreground" />
				<h3 className="text-sm font-semibold text-muted-foreground">Backlog</h3>
				<span className="text-xs text-muted-foreground/60">({tasks.length})</span>
			</div>
			{!isCollapsed && (
				<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
					{tasks.map((task) => (
						<ProjectTaskCard
							key={task.taskId}
							task={task}
							projectId={projectId}
							onClick={onTaskClick}
							canEdit={permissions.canEditTaskMetadata}
							canDelete={permissions.canDeleteTask}
							onEdit={onTaskEdit}
							onDelete={onTaskDelete}
						/>
					))}
				</div>
			)}
		</div>
	);
}
