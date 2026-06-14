"use client";

import { ProjectTaskCard } from "./ProjectTaskCard";
import type { ProjectTask } from "../api/execution.api";

interface MilestoneTaskGridProps {
	projectId: number;
	tasks: ProjectTask[];
	canEditTasks: boolean;
	canDeleteTasks: boolean;
	onTaskClick: (task: ProjectTask) => void;
	onTaskEdit?: (task: ProjectTask) => void;
	onTaskDelete?: (task: ProjectTask) => void;
}

export function MilestoneTaskGrid({ projectId, tasks, canEditTasks, canDeleteTasks, onTaskClick, onTaskEdit, onTaskDelete }: MilestoneTaskGridProps) {
	if (tasks.length === 0) {
		return (
			<div className="flex min-h-20 items-center justify-center rounded-md border border-dashed">
				<p className="text-xs text-muted-foreground">No tasks in this milestone yet.</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
			{tasks.map((task) => (
				<ProjectTaskCard
					key={task.taskId}
					task={task}
					projectId={projectId}
					onClick={onTaskClick}
					canEdit={canEditTasks}
					canDelete={canDeleteTasks}
					onEdit={onTaskEdit}
					onDelete={onTaskDelete}
				/>
			))}
		</div>
	);
}
