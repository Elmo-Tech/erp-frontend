"use client";

import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import type { ProjectFile } from "@/entities/project/model/types";

interface ProjectFileDeleteDialogProps {
	file: ProjectFile | null;
	isLoading: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

export function ProjectFileDeleteDialog({ file, isLoading, onOpenChange, onConfirm }: ProjectFileDeleteDialogProps) {
	return (
		<ConfirmDialog
			open={Boolean(file)}
			onOpenChange={onOpenChange}
			title="Delete file"
			description={
				<span>
					Delete <span className="font-medium text-foreground">{file?.name}</span>? This cannot be undone.
				</span>
			}
			confirmLabel="Delete"
			variant="destructive"
			onConfirm={onConfirm}
			isLoading={isLoading}
		/>
	);
}
