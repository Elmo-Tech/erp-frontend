"use client";

import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { Lead } from "../../../types/lead";

interface DeleteLeadDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	lead: Lead | null;
	onConfirm: () => void;
	isLoading?: boolean;
}

export function DeleteLeadDialog({ open, onOpenChange, lead, onConfirm, isLoading }: DeleteLeadDialogProps) {
	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Lead"
			description={`Are you sure you want to delete ${lead?.name}? This action cannot be undone.`}
			confirmLabel="Delete"
			onConfirm={onConfirm}
			variant="destructive"
			isLoading={isLoading}
		/>
	);
}
