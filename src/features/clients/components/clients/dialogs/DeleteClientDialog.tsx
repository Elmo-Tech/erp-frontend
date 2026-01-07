"use client";

import { ConfirmDialog } from "@/components/shared/dialogs/ConfirmDialog";
import { Client } from "../../../types";

interface DeleteClientDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	client: Client | null;
	onConfirm: () => void;
	isLoading?: boolean;
}

export function DeleteClientDialog({ open, onOpenChange, client, onConfirm, isLoading }: DeleteClientDialogProps) {
	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Client"
			description={`Are you sure you want to delete ${client?.name}? This action cannot be undone.`}
			confirmLabel="Delete"
			onConfirm={onConfirm}
			variant="destructive"
			isLoading={isLoading}
		/>
	);
}
