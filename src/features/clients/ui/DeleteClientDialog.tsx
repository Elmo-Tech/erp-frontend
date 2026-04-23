"use client";

import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import type { Client } from "@/entities/client/model/types";
import { useDeleteClient } from "../model/use-client-actions";

interface DeleteClientDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	client: Client | null;
	onSuccess?: () => void;
}

export function DeleteClientDialog({ open, onOpenChange, client, onSuccess }: DeleteClientDialogProps) {
	const deleteClient = useDeleteClient();

	const handleConfirm = async () => {
		if (!client) {
			return;
		}

		try {
			await deleteClient.mutateAsync(client.clientId);
			toast.success("Client deleted successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to delete client");
		}
	};

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Delete client"
			description={
				<span>
					Delete <span className="font-medium text-foreground">{client?.name}</span>? This action cannot be undone.
				</span>
			}
			confirmLabel="Delete"
			variant="destructive"
			isLoading={deleteClient.isPending}
			onConfirm={handleConfirm}
		/>
	);
}
