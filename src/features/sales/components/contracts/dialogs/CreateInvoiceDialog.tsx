"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateInvoiceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreateInvoice: (data: { dueDate?: string; notes?: string; sendImmediately: boolean }) => Promise<void>;
	isLoading: boolean;
	defaultDueDate?: string;
}

export function CreateInvoiceDialog({ open, onOpenChange, onCreateInvoice, isLoading, defaultDueDate }: CreateInvoiceDialogProps) {
	const [dueDate, setDueDate] = useState(defaultDueDate || "");
	const [notes, setNotes] = useState("");
	const [sendImmediately, setSendImmediately] = useState(false);

	const handleCreate = async () => {
		await onCreateInvoice({
			dueDate: dueDate || undefined,
			notes: notes || undefined,
			sendImmediately,
		});
		resetForm();
	};

	const resetForm = () => {
		setDueDate("");
		setNotes("");
		setSendImmediately(false);
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen && defaultDueDate) {
			setDueDate(defaultDueDate);
		}
		if (!isOpen) resetForm();
		onOpenChange(isOpen);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Invoice from Milestone</DialogTitle>
					<DialogDescription>Create an invoice for this milestone</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="invoiceDueDate">Due Date</Label>
						<Input
							id="invoiceDueDate"
							type="date"
							value={dueDate}
							onChange={(e) => setDueDate(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="invoiceNotes">Notes (Optional)</Label>
						<Textarea
							id="invoiceNotes"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Additional notes..."
							rows={3}
						/>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="sendImmediately"
							checked={sendImmediately}
							onCheckedChange={(checked) => setSendImmediately(checked === true)}
						/>
						<Label
							htmlFor="sendImmediately"
							className="text-sm font-normal cursor-pointer"
						>
							Send invoice immediately
						</Label>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						onClick={handleCreate}
						disabled={isLoading}
					>
						{isLoading ? "Creating..." : "Create Invoice"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
