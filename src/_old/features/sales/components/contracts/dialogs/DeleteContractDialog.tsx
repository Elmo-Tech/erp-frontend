"use client";

import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { Contract } from "../../../types/contract";

interface DeleteContractDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	contract: Contract | null;
	onConfirm: () => void;
	isLoading?: boolean;
}

export function DeleteContractDialog({ open, onOpenChange, contract, onConfirm, isLoading }: DeleteContractDialogProps) {
	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Contract"
			description={`Are you sure you want to delete contract ${contract?.contractNumber}? This action cannot be undone.`}
			confirmLabel="Delete"
			onConfirm={onConfirm}
			variant="destructive"
			isLoading={isLoading}
		/>
	);
}
