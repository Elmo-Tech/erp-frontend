"use client";

import type { Project } from "@/entities/project/model/types";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";

interface ProjectDeleteDialogProps {
	project: Project | null;
	isLoading: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

export function ProjectDeleteDialog({ project, isLoading, onOpenChange, onConfirm }: ProjectDeleteDialogProps) {
	return (
		<ConfirmDialog
			open={Boolean(project)}
			onOpenChange={onOpenChange}
			title="Delete project"
			description={
				<span>
					Delete <span className="font-medium text-foreground">{project?.title}</span>? This action cannot be undone.
				</span>
			}
			confirmLabel="Delete"
			variant="destructive"
			onConfirm={onConfirm}
			isLoading={isLoading}
		/>
	);
}
