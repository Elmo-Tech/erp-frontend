"use client";

import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import type { ChangeRequest } from "@/features/projects/api/execution.api";

interface ProjectChangeRequestDeleteDialogProps {
	changeRequest: ChangeRequest | null;
	isLoading: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

export function ProjectChangeRequestDeleteDialog({ changeRequest, isLoading, onOpenChange, onConfirm }: ProjectChangeRequestDeleteDialogProps) {
	return (
		<ConfirmDialog
			open={Boolean(changeRequest)}
			onOpenChange={onOpenChange}
			title="Delete change request"
			description={
				<span>
					Delete <span className="font-medium text-foreground">{changeRequest?.title}</span>? This action cannot be undone.
				</span>
			}
			confirmLabel="Delete"
			variant="destructive"
			onConfirm={onConfirm}
			isLoading={isLoading}
		/>
	);
}
