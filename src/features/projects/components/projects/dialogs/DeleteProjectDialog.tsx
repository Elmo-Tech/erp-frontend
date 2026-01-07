"use client";

import { ConfirmDialog } from "@/components/shared/dialogs/ConfirmDialog";
import { Project } from "../../../types/project";

interface DeleteProjectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	project: Project | null;
	onConfirm: () => void;
	isLoading?: boolean;
}

export function DeleteProjectDialog({ open, onOpenChange, project, onConfirm, isLoading }: DeleteProjectDialogProps) {
	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Project"
			description={`Are you sure you want to delete "${project?.title}"? This action cannot be undone.`}
			confirmLabel="Delete"
			onConfirm={onConfirm}
			variant="destructive"
			isLoading={isLoading}
		/>
	);
}
