"use client";

/**
 * Admin Delete Deliverable Dialog
 * Allows admin to permanently delete a deliverable
 */

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { TaskDeliverable } from "@/features/projects/types/taskDeliverable";
import { useAdminDeleteDeliverable } from "../../hooks/useAdminDeliverables";

interface AdminDeleteDeliverableDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deliverable: TaskDeliverable;
}

export function AdminDeleteDeliverableDialog({ open, onOpenChange, deliverable }: AdminDeleteDeliverableDialogProps) {
	const deleteMutation = useAdminDeleteDeliverable();

	const handleDelete = () => {
		deleteMutation.mutate(deliverable.deliverableId, {
			onSuccess: () => {
				onOpenChange(false);
			},
		});
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Delete Deliverable</DialogTitle>
					<DialogDescription>This action cannot be undone. The deliverable will be permanently deleted.</DialogDescription>
				</DialogHeader>

				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						<strong>Warning:</strong> You are about to permanently delete this deliverable. All associated data will be lost.
					</AlertDescription>
				</Alert>

				<div className="space-y-2">
					<div>
						<span className="text-sm font-medium">Deliverable:</span>
						<p className="text-sm text-muted-foreground">{deliverable.title}</p>
					</div>
					<div>
						<span className="text-sm font-medium">Current Status:</span>
						<p className="text-sm text-muted-foreground capitalize">{deliverable.status.replace("_", " ")}</p>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={deleteMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={deleteMutation.isPending}
					>
						{deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
