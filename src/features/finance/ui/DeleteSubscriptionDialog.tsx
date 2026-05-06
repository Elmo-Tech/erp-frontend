"use client";

import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { useDeleteSubscription } from "@/features/finance/model/use-finance-actions";
import type { Subscription } from "@/entities/finance/model/types";

interface DeleteSubscriptionDialogProps {
	open: boolean;
	onClose: () => void;
	subscription: Subscription | null;
}

export function DeleteSubscriptionDialog({ open, onClose, subscription }: DeleteSubscriptionDialogProps) {
	const deleteSubscription = useDeleteSubscription();

	const handleConfirm = async () => {
		if (!subscription) return;

		try {
			await deleteSubscription.mutateAsync(subscription.id);
			toast.success(`"${subscription.name}" subscription deleted`);
			onClose();
		} catch {
			toast.error("Failed to delete subscription");
		}
	};

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			title="Delete Subscription"
			description={
				subscription ? (
					<span>
						Are you sure you want to delete the <strong>{subscription.name}</strong> subscription? This action cannot be undone.
					</span>
				) : (
					"Are you sure you want to delete this subscription?"
				)
			}
			confirmLabel="Delete Subscription"
			variant="destructive"
			onConfirm={handleConfirm}
			isLoading={deleteSubscription.isPending}
		/>
	);
}
