"use client";

import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { Quotation } from "../../../types/quotation";

interface DeleteQuotationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	quotation: Quotation | null;
	onConfirm: () => void;
	isLoading?: boolean;
}

export function DeleteQuotationDialog({ open, onOpenChange, quotation, onConfirm, isLoading }: DeleteQuotationDialogProps) {
	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Quotation"
			description={`Are you sure you want to delete quotation #${quotation?.quotationId}? This action cannot be undone.`}
			confirmLabel="Delete"
			onConfirm={onConfirm}
			variant="destructive"
			isLoading={isLoading}
		/>
	);
}
