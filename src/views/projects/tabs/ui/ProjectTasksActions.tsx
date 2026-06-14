"use client";

import { Inbox, Layers, ListTodo, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/Can";

interface ProjectTasksActionsProps {
	canAddMilestones: boolean;
	canAddTasks: boolean;
	onAddMilestone: () => void;
	onAddTask: () => void;
}

interface ProjectTasksActionHeaderProps extends ProjectTasksActionsProps {
	milestoneCount: number;
	taskCount: number;
}

export function ProjectTasksActionHeader({
	milestoneCount,
	taskCount,
	canAddMilestones,
	canAddTasks,
	onAddMilestone,
	onAddTask,
}: ProjectTasksActionHeaderProps) {
	return (
		<div className="mb-4 flex items-center justify-between gap-3">
			<p className="text-sm text-muted-foreground">
				{milestoneCount} {milestoneCount === 1 ? "milestone" : "milestones"} · {taskCount} {taskCount === 1 ? "task" : "tasks"}
			</p>
			<ProjectTasksActionButtons
				canAddMilestones={canAddMilestones}
				canAddTasks={canAddTasks}
				onAddMilestone={onAddMilestone}
				onAddTask={onAddTask}
			/>
		</div>
	);
}

export function ProjectTasksEmptyState({ canAddMilestones, canAddTasks, onAddMilestone, onAddTask }: ProjectTasksActionsProps) {
	return (
		<div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-md border border-dashed text-center">
			<Inbox className="size-8 text-muted-foreground/40" />
			<div className="text-sm font-medium text-muted-foreground">No tasks yet</div>
			<p className="max-w-xs text-xs text-muted-foreground/70">Create a milestone to group tasks, or add a task directly to the backlog.</p>
			<ProjectTasksActionButtons
				canAddMilestones={canAddMilestones}
				canAddTasks={canAddTasks}
				onAddMilestone={onAddMilestone}
				onAddTask={onAddTask}
				taskIcon="list"
			/>
		</div>
	);
}

function ProjectTasksActionButtons({
	canAddMilestones,
	canAddTasks,
	onAddMilestone,
	onAddTask,
	taskIcon = "plus",
}: ProjectTasksActionsProps & { taskIcon?: "plus" | "list" }) {
	if (!canAddMilestones && !canAddTasks) {
		return null;
	}

	const TaskIcon = taskIcon === "list" ? ListTodo : Plus;

	return (
		<div className="flex items-center gap-2">
			{canAddMilestones && <AddMilestoneButton onAddMilestone={onAddMilestone} />}
			{canAddTasks && (
				<AddTaskButton
					icon={TaskIcon}
					onAddTask={onAddTask}
				/>
			)}
		</div>
	);
}

function AddMilestoneButton({ onAddMilestone }: { onAddMilestone: () => void }) {
	return (
		<Can permission={["manage_projects", "manage_all_projects"]}>
			<Button
				size="sm"
				variant="outline"
				onClick={onAddMilestone}
			>
				<Layers className="size-4" />
				Add Milestone
			</Button>
		</Can>
	);
}

function AddTaskButton({ icon: TaskIcon, onAddTask }: { icon: typeof Plus; onAddTask: () => void }) {
	return (
		<Can permission={["create_tasks", "manage_tasks"]}>
			<Button
				size="sm"
				onClick={onAddTask}
			>
				<TaskIcon className="size-4" />
				Add Task
			</Button>
		</Can>
	);
}
