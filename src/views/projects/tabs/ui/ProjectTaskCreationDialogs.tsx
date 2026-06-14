"use client";

import type { UseFormReturn } from "react-hook-form";
import type { ProjectTaskFilterOption } from "../model/project-tasks-filters";
import type { AddMilestoneFormData, AddTaskFormData } from "../model/project-task-forms";
import { ProjectAddMilestoneDialog } from "./ProjectAddMilestoneDialog";
import { ProjectAddTaskDialog } from "./ProjectAddTaskDialog";

interface ProjectTaskCreationDialogsProps {
	canAddMilestones: boolean;
	canAddTasks: boolean;
	milestoneOpen: boolean;
	taskOpen: boolean;
	isCreatingMilestone: boolean;
	isCreatingTask: boolean;
	isMembersLoading: boolean;
	milestoneOptions: ProjectTaskFilterOption[];
	assigneeOptions: ProjectTaskFilterOption[];
	milestoneForm: UseFormReturn<AddMilestoneFormData>;
	taskForm: UseFormReturn<AddTaskFormData>;
	onMilestoneOpenChange: (open: boolean) => void;
	onTaskOpenChange: (open: boolean) => void;
	onMilestoneSubmit: () => void;
	onTaskSubmit: () => void;
}

export function ProjectTaskCreationDialogs({
	canAddMilestones,
	canAddTasks,
	milestoneOpen,
	taskOpen,
	isCreatingMilestone,
	isCreatingTask,
	isMembersLoading,
	milestoneOptions,
	assigneeOptions,
	milestoneForm,
	taskForm,
	onMilestoneOpenChange,
	onTaskOpenChange,
	onMilestoneSubmit,
	onTaskSubmit,
}: ProjectTaskCreationDialogsProps) {
	return (
		<>
			{canAddMilestones && (
				<ProjectAddMilestoneDialog
					open={milestoneOpen}
					form={milestoneForm}
					isLoading={isCreatingMilestone}
					onOpenChange={onMilestoneOpenChange}
					onSubmit={onMilestoneSubmit}
				/>
			)}
			{canAddTasks && (
				<ProjectAddTaskDialog
					open={taskOpen}
					form={taskForm}
					isLoading={isCreatingTask}
					isMembersLoading={isMembersLoading}
					milestoneOptions={milestoneOptions}
					assigneeOptions={assigneeOptions}
					onOpenChange={onTaskOpenChange}
					onSubmit={onTaskSubmit}
				/>
			)}
		</>
	);
}
