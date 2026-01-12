/**
 * Delete Role Confirmation Dialog
 */

"use client";

import { ConfirmDialog } from "@/components/shared";
import { Role } from "../../types";

interface DeleteRoleDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	role: Role | null;
	onConfirm: () => void;
	isPending: boolean;
}

export function DeleteRoleDialog({ open, onOpenChange, role, onConfirm, isPending }: DeleteRoleDialogProps) {
	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Role"
			description={`Are you sure you want to delete the role "${role?.name}"? This action cannot be undone.`}
			confirmLabel="Delete"
			onConfirm={onConfirm}
			variant="destructive"
			isLoading={isPending}
		/>
	);
}
