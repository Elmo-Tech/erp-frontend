"use client";

import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { useDeleteInvoice } from "@/features/finance/model/use-finance-actions";
import type { Invoice } from "@/entities/finance/model/types";

interface DeleteInvoiceDialogProps {
	open: boolean;
	onClose: () => void;
	invoice: Invoice | null;
}

export function DeleteInvoiceDialog({ open, onClose, invoice }: DeleteInvoiceDialogProps) {
	const deleteInvoice = useDeleteInvoice();

	const handleConfirm = async () => {
		if (!invoice) return;

		try {
			await deleteInvoice.mutateAsync(invoice.id);
			toast.success(`Invoice ${invoice.invoiceNumber} deleted`);
			onClose();
		} catch {
			toast.error("Failed to delete invoice");
		}
	};

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			title="Delete Invoice"
			description={
				invoice ? (
					<span>
						Are you sure you want to delete invoice <strong>{invoice.invoiceNumber}</strong>? This action cannot be undone.
					</span>
				) : (
					"Are you sure you want to delete this invoice?"
				)
			}
			confirmLabel="Delete Invoice"
			variant="destructive"
			onConfirm={handleConfirm}
			isLoading={deleteInvoice.isPending}
		/>
	);
}
