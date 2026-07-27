"use client";

import type { UseFormReturn } from "react-hook-form";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import type { ProjectTask } from "@/features/projects/api/execution.api";
import type { EditTaskFormData } from "../model/project-task-forms";
import type { ProjectTaskFilterOption } from "../model/project-tasks-filters";
import { ProjectTaskFormFields } from "./ProjectTaskFormFields";

interface ProjectTaskMetadataDialogsProps {
	editingTask: ProjectTask | null;
	deletingTask: ProjectTask | null;
	editTaskForm: UseFormReturn<EditTaskFormData>;
	isUpdatingTask: boolean;
	isDeletingTask: boolean;
	isMembersLoading: boolean;
	milestoneOptions: ProjectTaskFilterOption[];
	assigneeOptions: ProjectTaskFilterOption[];
	onEditOpenChange: (open: boolean) => void;
	onDeleteOpenChange: (open: boolean) => void;
	onEditSubmit: () => void;
	onDeleteConfirm: () => void;
}

export function ProjectTaskMetadataDialogs({
	editingTask,
	deletingTask,
	editTaskForm,
	isUpdatingTask,
	isDeletingTask,
	isMembersLoading,
	milestoneOptions,
	assigneeOptions,
	onEditOpenChange,
	onDeleteOpenChange,
	onEditSubmit,
	onDeleteConfirm,
}: ProjectTaskMetadataDialogsProps) {
	return (
		<>
			<FormDialog
				open={Boolean(editingTask)}
				onOpenChange={onEditOpenChange}
				title="Edit Task"
				description="Update task details, assignment, and scheduling."
				submitLabel="Save Task"
				isLoading={isUpdatingTask}
				onSubmit={onEditSubmit}
				size="xxl"
			>
				<Form {...editTaskForm}>
					<ProjectTaskFormFields
						form={editTaskForm}
						isMembersLoading={isMembersLoading}
						milestoneOptions={milestoneOptions}
						assigneeOptions={assigneeOptions}
					/>
				</Form>
			</FormDialog>
			<ConfirmDialog
				open={Boolean(deletingTask)}
				onOpenChange={onDeleteOpenChange}
				title="Delete Task"
				description={
					deletingTask ? (
						<span>
							Are you sure you want to delete <strong>{deletingTask.title}</strong>? This action cannot be undone.
						</span>
					) : (
						"Are you sure you want to delete this task?"
					)
				}
				confirmLabel="Delete Task"
				variant="destructive"
				isLoading={isDeletingTask}
				onConfirm={onDeleteConfirm}
			/>
		</>
	);
}
