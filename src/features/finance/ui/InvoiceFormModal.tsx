"use client";

import { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Form } from "@/shared/ui/form";
import { Button } from "@/shared/ui/button";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { FormCombobox } from "@/shared/ui/forms/FormCombobox";
import { useCreateInvoice, useUpdateInvoice } from "@/features/finance/model/use-finance-actions";
import { invoiceSchema, INVOICE_DEFAULT_VALUES, type InvoiceFormData } from "@/features/finance/model/finance.schema";
import type { Invoice } from "@/entities/finance/model/types";
import { useGetInternalUsers } from "@/entities/user/api/user.api";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
	{ value: "draft", label: "Draft" },
	{ value: "sent", label: "Sent" },
	{ value: "paid", label: "Paid" },
	{ value: "overdue", label: "Overdue" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface InvoiceFormModalProps {
	open: boolean;
	onClose: () => void;
	editTarget: Invoice | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function InvoiceFormModal({ open, onClose, editTarget }: InvoiceFormModalProps) {
	const isEditing = editTarget !== null;
	const createInvoice = useCreateInvoice();
	const updateInvoice = useUpdateInvoice();

	// Fetch clients for the combobox
	const usersQuery = useGetInternalUsers(open);
	const clientOptions = useMemo(
		() =>
			(usersQuery.data?.users ?? []).map((u) => ({
				value: String(u.id),
				label: u.name,
			})),
		[usersQuery.data],
	);

	// Cast resolver to bypass z.coerce type mismatch (Zod v4 + @hookform/resolvers v5)
	const form = useForm<InvoiceFormData>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(invoiceSchema) as any,
		defaultValues: INVOICE_DEFAULT_VALUES,
	});

	// useFieldArray for dynamic line items
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "items",
	});

	// Sync form when modal opens or editTarget changes
	useEffect(() => {
		if (!open) return;

		if (editTarget) {
			form.reset({
				clientId: editTarget.clientId,
				projectId: editTarget.projectId ?? null,
				issueDate: editTarget.issueDate,
				dueDate: editTarget.dueDate,
				taxRate: editTarget.taxRate,
				discountAmount: editTarget.discountAmount,
				status: editTarget.status,
				notes: editTarget.notes ?? "",
				items: editTarget.items?.length
					? editTarget.items.map((item) => ({
							description: item.description,
							quantity: item.quantity,
							unitPrice: item.unitPrice,
						}))
					: [{ description: "", quantity: 1, unitPrice: 0 }],
			});
		} else {
			form.reset(INVOICE_DEFAULT_VALUES);
		}
	}, [open, editTarget, form]);

	const handleSubmit = async (data: InvoiceFormData) => {
		try {
			const payload = {
				...data,
				clientId: Number(data.clientId),
				projectId: data.projectId ? Number(data.projectId) : null,
			};

			if (isEditing) {
				await updateInvoice.mutateAsync({ id: editTarget.id, payload });
				toast.success("Invoice updated successfully");
			} else {
				await createInvoice.mutateAsync(payload);
				toast.success("Invoice created successfully");
			}
			onClose();
		} catch {
			toast.error(isEditing ? "Failed to update invoice" : "Failed to create invoice");
		}
	};

	const isPending = createInvoice.isPending || updateInvoice.isPending;

	return (
		<FormDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			title={isEditing ? `Edit Invoice ${editTarget?.invoiceNumber ?? ""}` : "Create Invoice"}
			description={isEditing ? "Update the invoice details and line items." : "Create a new invoice with line items for a client."}
			onSubmit={form.handleSubmit(handleSubmit as Parameters<typeof form.handleSubmit>[0])}
			submitLabel={isEditing ? "Save Changes" : "Create Invoice"}
			isLoading={isPending}
			size="4xl"
		>
			<Form {...form}>
				<div className="flex flex-col gap-5">
					{/* ── Client & Project ── */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<FormCombobox
							control={form.control}
							name="clientId"
							label="Client"
							placeholder="Select a client…"
							searchPlaceholder="Search clients…"
							options={clientOptions}
							disabled={isPending || usersQuery.isLoading}
						/>
						<FormInput
							control={form.control}
							name="projectId"
							label="Project ID (optional)"
							type="number"
							placeholder="e.g. 5"
							disabled={isPending}
						/>
					</div>

					{/* ── Dates ── */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<FormInput
							control={form.control}
							name="issueDate"
							label="Issue Date"
							type="date"
							disabled={isPending}
						/>
						<FormInput
							control={form.control}
							name="dueDate"
							label="Due Date"
							type="date"
							disabled={isPending}
						/>
					</div>

					{/* ── Financials ── */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<FormInput
							control={form.control}
							name="taxRate"
							label="Tax Rate (%)"
							type="number"
							min={0}
							max={100}
							step="0.01"
							placeholder="0"
							disabled={isPending}
						/>
						<FormInput
							control={form.control}
							name="discountAmount"
							label="Discount ($)"
							type="number"
							min={0}
							step="0.01"
							placeholder="0.00"
							disabled={isPending}
						/>
						<FormSelect
							control={form.control}
							name="status"
							label="Status"
							options={STATUS_OPTIONS}
							disabled={isPending}
						/>
					</div>

					{/* ── Line Items ── */}
					<div className="flex flex-col gap-3">
						<div className="flex items-center justify-between">
							<p className="text-sm font-medium">Line Items</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="gap-1.5"
								disabled={isPending}
								onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
							>
								<Plus className="h-3.5 w-3.5" />
								Add Item
							</Button>
						</div>

						<div className="flex flex-col gap-3">
							{fields.map((field, index) => (
								<div
									key={field.id}
									className="grid grid-cols-[1fr_80px_100px_36px] items-end gap-2 rounded-md border p-3"
								>
									<FormInput
										control={form.control}
										name={`items.${index}.description`}
										label={index === 0 ? "Description" : undefined}
										placeholder="Service or product description"
										disabled={isPending}
									/>
									<FormInput
										control={form.control}
										name={`items.${index}.quantity`}
										label={index === 0 ? "Qty" : undefined}
										type="number"
										min={1}
										placeholder="1"
										disabled={isPending}
									/>
									<FormInput
										control={form.control}
										name={`items.${index}.unitPrice`}
										label={index === 0 ? "Unit Price" : undefined}
										type="number"
										min={0}
										step="0.01"
										placeholder="0.00"
										disabled={isPending}
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="h-9 w-9 shrink-0 text-destructive hover:text-destructive self-end"
										disabled={isPending || fields.length === 1}
										onClick={() => remove(index)}
									>
										<Trash2 className="h-3.5 w-3.5" />
										<span className="sr-only">Remove item</span>
									</Button>
								</div>
							))}
						</div>
					</div>

					{/* ── Notes ── */}
					<FormTextarea
						control={form.control}
						name="notes"
						label="Notes (optional)"
						placeholder="Additional notes or payment instructions…"
						rows={3}
						disabled={isPending}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
