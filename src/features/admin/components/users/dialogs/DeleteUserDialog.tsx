"use client";

import { ConfirmDialog } from "@/components/shared/dialogs/ConfirmDialog";
import { User } from "../../../types";

interface DeleteUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User | null;
	onConfirm: () => void;
	isLoading?: boolean;
}

export function DeleteUserDialog({ open, onOpenChange, user, onConfirm, isLoading }: DeleteUserDialogProps) {
	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Delete User"
			description={`Are you sure you want to delete ${user?.name}? This action cannot be undone.`}
			confirmLabel="Delete"
			onConfirm={onConfirm}
			variant="destructive"
			isLoading={isLoading}
		/>
	);
}
