/**
 * Reject Change Request Dialog
 */

"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormDialog } from "@/components/shared";

interface RejectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	reason: string;
	onReasonChange: (reason: string) => void;
	onConfirm: () => void;
	isLoading: boolean;
}

export function RejectDialog({ open, onOpenChange, reason, onReasonChange, onConfirm, isLoading }: RejectDialogProps) {
	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Reject Change Request"
			submitLabel="Reject"
			isLoading={isLoading}
			isSubmitDisabled={!reason}
			onSubmit={onConfirm}
			size="md"
		>
			<div className="space-y-4">
				<p className="text-sm text-muted-foreground">Please provide a reason for rejection:</p>
				<div className="space-y-2">
					<Label htmlFor="reason">Reason</Label>
					<Textarea
						id="reason"
						value={reason}
						onChange={(e) => onReasonChange(e.target.value)}
						placeholder="Rejection reason..."
						rows={3}
					/>
				</div>
			</div>
		</FormDialog>
	);
}
