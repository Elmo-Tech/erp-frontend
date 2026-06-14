"use client";

import type { Milestone, ProjectTask } from "../api/execution.api";
import { buildMilestoneSwimlaneView } from "../model/milestone-swimlane-view";
import { MilestoneSwimlaneHeader } from "./MilestoneSwimlaneHeader";
import { MilestoneTaskGrid } from "./MilestoneTaskGrid";

export interface MilestoneSwimlaneProps {
	milestone: Milestone;
	tasks: ProjectTask[];
	projectId: number;
	onTaskClick: (task: ProjectTask) => void;
	canEditTasks?: boolean;
	canDeleteTasks?: boolean;
	onTaskEdit?: (task: ProjectTask) => void;
	onTaskDelete?: (task: ProjectTask) => void;
	isCollapsed?: boolean;
	onToggleCollapse?: () => void;
}

export function MilestoneSwimlane({
	milestone,
	tasks,
	projectId,
	onTaskClick,
	canEditTasks = false,
	canDeleteTasks = false,
	onTaskEdit,
	onTaskDelete,
	isCollapsed = false,
	onToggleCollapse,
}: MilestoneSwimlaneProps) {
	const view = buildMilestoneSwimlaneView(milestone, tasks.length);

	return (
		<div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4">
			<MilestoneSwimlaneHeader
				milestone={milestone}
				view={view}
				isCollapsed={isCollapsed}
				onToggleCollapse={onToggleCollapse}
			/>
			{!isCollapsed && (
				<MilestoneTaskGrid
					projectId={projectId}
					tasks={tasks}
					canEditTasks={canEditTasks}
					canDeleteTasks={canDeleteTasks}
					onTaskClick={onTaskClick}
					onTaskEdit={onTaskEdit}
					onTaskDelete={onTaskDelete}
				/>
			)}
		</div>
	);
}
