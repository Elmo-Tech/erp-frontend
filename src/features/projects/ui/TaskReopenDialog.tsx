"use client";

import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";

interface TaskReopenDialogProps {
	open: boolean;
	currentStatusLabel: string;
	pendingStatusLabel: string;
	reason: string;
	isSaving: boolean;
	onOpenChange: (open: boolean) => void;
	onReasonChange: (reason: string) => void;
	onCancel: () => void;
	onConfirm: () => void;
}

export function TaskReopenDialog({ open, currentStatusLabel, pendingStatusLabel, reason, isSaving, onOpenChange, onReasonChange, onCancel, onConfirm }: TaskReopenDialogProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Reason for Reopening</DialogTitle>
					<DialogDescription>
						This task is currently in <strong>{currentStatusLabel}</strong>. Please provide a reason before moving it to <strong>{pendingStatusLabel}</strong>.
					</DialogDescription>
				</DialogHeader>
				<div className="py-2">
					<Textarea
						value={reason}
						onChange={(event) => onReasonChange(event.target.value)}
						placeholder="e.g. QA found a regression in the login flow…"
						className="min-h-24 resize-none text-sm"
						autoFocus
					/>
				</div>
				<DialogFooter className="gap-2">
					<Button
						variant="outline"
						onClick={onCancel}
					>
						Cancel
					</Button>
					<Button
						onClick={onConfirm}
						disabled={!reason.trim() || isSaving}
					>
						{isSaving ? "Saving…" : "Confirm Reopen"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
