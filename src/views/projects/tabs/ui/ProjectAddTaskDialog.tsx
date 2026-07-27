"use client";

import type { UseFormReturn } from "react-hook-form";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import type { AddTaskFormData } from "../model/project-task-forms";
import type { ProjectTaskFilterOption } from "../model/project-tasks-filters";
import { ProjectTaskFormFields } from "./ProjectTaskFormFields";

interface ProjectAddTaskDialogProps {
	open: boolean;
	form: UseFormReturn<AddTaskFormData>;
	isLoading: boolean;
	isMembersLoading: boolean;
	milestoneOptions: ProjectTaskFilterOption[];
	assigneeOptions: ProjectTaskFilterOption[];
	onOpenChange: (open: boolean) => void;
	onSubmit: () => void;
}

export function ProjectAddTaskDialog({
	open,
	form,
	isLoading,
	isMembersLoading,
	milestoneOptions,
	assigneeOptions,
	onOpenChange,
	onSubmit,
}: ProjectAddTaskDialogProps) {
	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="New Task"
			description="Add a task to this project. Optionally assign it to a milestone."
			submitLabel="Create Task"
			isLoading={isLoading}
			onSubmit={onSubmit}
			size="xxl"
		>
			<Form {...form}>
				<ProjectTaskFormFields
					form={form}
					isMembersLoading={isMembersLoading}
					milestoneOptions={milestoneOptions}
					assigneeOptions={assigneeOptions}
				/>
			</Form>
		</FormDialog>
	);
}
