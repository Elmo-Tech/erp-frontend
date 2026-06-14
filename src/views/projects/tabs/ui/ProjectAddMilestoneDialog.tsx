"use client";

import type { UseFormReturn } from "react-hook-form";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import type { AddMilestoneFormData } from "../model/project-task-forms";

interface ProjectAddMilestoneDialogProps {
	open: boolean;
	form: UseFormReturn<AddMilestoneFormData>;
	isLoading: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: () => void;
}

export function ProjectAddMilestoneDialog({ open, form, isLoading, onOpenChange, onSubmit }: ProjectAddMilestoneDialogProps) {
	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="New Milestone"
			description="Group related tasks under a milestone to track delivery phases."
			submitLabel="Create Milestone"
			isLoading={isLoading}
			onSubmit={onSubmit}
			size="sm"
		>
			<Form {...form}>
				<FormInput
					control={form.control}
					name="title"
					label="Milestone title"
					placeholder="e.g. Phase 1 — Design"
				/>
			</Form>
		</FormDialog>
	);
}
