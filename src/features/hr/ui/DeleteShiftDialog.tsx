"use client";

import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { useDeleteShift } from "@/features/hr/model/use-hr-actions";
import type { Shift } from "@/entities/hr/model/types";

interface DeleteShiftDialogProps {
	open: boolean;
	onClose: () => void;
	/** The shift to delete. Pass null when no deletion is pending. */
	shift: Shift | null;
}

export function DeleteShiftDialog({ open, onClose, shift }: DeleteShiftDialogProps) {
	const deleteShift = useDeleteShift();

	const handleConfirm = async () => {
		if (!shift) return;

		try {
			await deleteShift.mutateAsync(shift.id);
			toast.success("Shift deleted successfully");
			onClose();
		} catch {
			toast.error("Failed to delete shift");
		}
	};

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			title="Delete shift"
			description={
				<span>
					Delete <span className="font-medium text-foreground">{shift?.name}</span>? Employees assigned to this shift will lose their shift assignment.
				</span>
			}
			confirmLabel="Delete"
			variant="destructive"
			isLoading={deleteShift.isPending}
			onConfirm={handleConfirm}
		/>
	);
}
