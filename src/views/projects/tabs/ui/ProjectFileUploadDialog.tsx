"use client";

import type { UseFormReturn } from "react-hook-form";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { formatProjectFileSize, projectFileCategoryOptions, type ProjectFileUploadFormData } from "../model/project-files";

interface ProjectFileUploadDialogProps {
	open: boolean;
	pendingFile: File | null;
	form: UseFormReturn<ProjectFileUploadFormData>;
	isLoading: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: () => void;
}

export function ProjectFileUploadDialog({ open, pendingFile, form, isLoading, onOpenChange, onSubmit }: ProjectFileUploadDialogProps) {
	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Upload File"
			description={pendingFile ? `${pendingFile.name} · ${formatProjectFileSize(pendingFile.size)}` : "Configure file details before uploading."}
			submitLabel="Upload"
			isLoading={isLoading}
			onSubmit={onSubmit}
			size="md"
		>
			<Form {...form}>
				<div className="flex flex-col gap-4">
					<FormInput
						control={form.control}
						name="name"
						label="Display name"
						placeholder="e.g. Final Wireframes"
					/>
					<FormSelect
						control={form.control}
						name="category"
						label="Category"
						options={projectFileCategoryOptions}
					/>
					<FormTextarea
						control={form.control}
						name="description"
						label="Description (optional)"
						placeholder="Brief note about this file…"
						rows={2}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
