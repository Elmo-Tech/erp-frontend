"use client";

import { useState } from "react";
import { FormDialog } from "@/components/shared";
import { DatePicker } from "@/components/shared/forms/DatePicker";
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
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Create Invoice from Milestone"
			description="Create an invoice for this milestone"
			submitLabel="Create Invoice"
			isLoading={isLoading}
			onSubmit={handleCreate}
		>
			<div className="space-y-4">
				<div className="space-y-2">
					<Label>Due Date</Label>
					<DatePicker value={dueDate} onChange={setDueDate} placeholder="Choose a due date" />
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
		</FormDialog>
	);
}
