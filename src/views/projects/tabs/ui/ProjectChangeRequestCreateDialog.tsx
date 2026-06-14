"use client";

import { FormProvider, type UseFormReturn } from "react-hook-form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import type { CreateChangeRequestFormData } from "../model/project-change-requests";

interface ProjectChangeRequestCreateDialogProps {
	open: boolean;
	form: UseFormReturn<CreateChangeRequestFormData>;
	isLoading: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: () => void;
}

export function ProjectChangeRequestCreateDialog({ open, form, isLoading, onOpenChange, onSubmit }: ProjectChangeRequestCreateDialogProps) {
	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="New Change Request"
			description="Document a scope change or additional work item. It will be created in Draft status."
			submitLabel="Create"
			isLoading={isLoading}
			onSubmit={onSubmit}
			size="md"
		>
			<FormProvider {...form}>
				<div className="flex flex-col gap-4">
					<FormInput
						control={form.control}
						name="title"
						label="Title"
						placeholder="e.g. Add dark mode support"
					/>
					<FormTextarea
						control={form.control}
						name="description"
						label="Description"
						placeholder="Describe the change in detail…"
						rows={4}
					/>
					<FormInput
						control={form.control}
						name="price"
						label="Price"
						type="number"
						placeholder="0"
						min={0}
						step={0.01}
					/>
				</div>
			</FormProvider>
		</FormDialog>
	);
}
