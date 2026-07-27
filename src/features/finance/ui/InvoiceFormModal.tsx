"use client";

import { useEffect, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Form } from "@/shared/ui/form";
import { Button } from "@/shared/ui/button";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormDatePicker } from "@/shared/ui/forms/FormDatePicker";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { FormCombobox } from "@/shared/ui/forms/FormCombobox";
import { useCreateInvoice, useUpdateInvoice, useInvoice } from "@/features/finance/model/use-finance-actions";
import { invoiceSchema, INVOICE_DEFAULT_VALUES, type InvoiceFormData } from "@/features/finance/model/finance.schema";
import type { Invoice } from "@/entities/finance/model/types";
import { useClientsQuery } from "@/entities/client/api/client.api";
import { useGetClientProjects } from "@/entities/project/api/project.api";
import { useSettingsDictionary } from "@/shared/api/settings.api";
import { useInvoicePermissions } from "@/entities/user/model/permissions";

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
	const { canCreateInvoices, canEditInvoices, canSendInvoices } = useInvoicePermissions();
	const isEditing = editTarget !== null;
	const createInvoice = useCreateInvoice();
	const updateInvoice = useUpdateInvoice();

	// Fetch the full invoice (with items) when editing — the list endpoint
	// does not eager-load items, so we need the detail endpoint.
	const invoiceDetailQuery = useInvoice(isEditing && open ? editTarget.id : null);
	// Use the fully-loaded invoice if available, otherwise fall back to the
	// list-level editTarget (covers the brief loading window).
	const fullInvoice = invoiceDetailQuery.data ?? editTarget;

	// Cast resolver to bypass z.coerce type mismatch (Zod v4 + @hookform/resolvers v5)
	const form = useForm<InvoiceFormData>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(invoiceSchema) as any,
		defaultValues: INVOICE_DEFAULT_VALUES,
	});

	const selectedClientId = useWatch({ control: form.control, name: "clientId" });
	const invoiceType = useWatch({ control: form.control, name: "invoiceType" });

	// Fetch clients for the combobox
	const clientsQuery = useClientsQuery(open ? undefined : undefined);
	const clientOptions = useMemo(
		() =>
			(clientsQuery.data?.clients ?? []).map((c) => ({
				value: String(c.id),
				label: c.display_name,
			})),
		[clientsQuery.data],
	);

	// Fetch projects filtered by selected client
	const projectsQuery = useGetClientProjects(Number(selectedClientId) || 0, open && Number(selectedClientId) > 0);
	const projectOptions = useMemo(
		() =>
			(projectsQuery.data ?? []).map((p) => ({
				value: String(p.projectId),
				label: p.title,
			})),
		[projectsQuery.data],
	);

	// Invoice statuses from settings dictionary
	const statusDict = useSettingsDictionary("invoice-statuses", open);
	// Fallback to hardcoded options if dictionary is empty (e.g. not yet seeded)
	const allStatusOptions =
		statusDict.options.length > 0
			? statusDict.options
			: [
					{ value: "draft", label: "Draft" },
					{ value: "sent", label: "Sent" },
					{ value: "paid", label: "Paid" },
					{ value: "overdue", label: "Overdue" },
				];
	const statusOptions = allStatusOptions.filter((option) => option.value !== "sent" || canSendInvoices || fullInvoice?.status === "sent");

	// useFieldArray for dynamic line items
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "items",
	});

	// Sync form when modal opens, editTarget changes, or the full invoice detail loads
	useEffect(() => {
		if (!open) return;

		if (fullInvoice) {
			form.reset({
				clientId: Number(fullInvoice.clientId),
				projectId: fullInvoice.projectId ? Number(fullInvoice.projectId) : null,
				invoiceType: fullInvoice.invoiceType ?? "one_time",
				billingCycle: fullInvoice.billingCycle ?? null,
				issueDate: fullInvoice.issueDate,
				dueDate: fullInvoice.dueDate,
				taxRate: fullInvoice.taxRate,
				discountAmount: fullInvoice.discountAmount,
				status: fullInvoice.status,
				notes: fullInvoice.notes ?? "",
				items: fullInvoice.items?.length
					? fullInvoice.items.map((item) => ({
							description: item.description,
							quantity: item.quantity,
							unitPrice: item.unitPrice,
						}))
					: [{ description: "", quantity: 1, unitPrice: 0 }],
			});
		} else {
			form.reset(INVOICE_DEFAULT_VALUES);
		}
	}, [open, fullInvoice, form]);

	const handleSubmit = async (data: InvoiceFormData) => {
		if ((isEditing && !canEditInvoices) || (!isEditing && !canCreateInvoices)) {
			toast.error(`You do not have permission to ${isEditing ? "edit" : "create"} invoices`);
			return;
		}

		if (data.status === "sent" && fullInvoice?.status !== "sent" && !canSendInvoices) {
			toast.error("You do not have permission to send invoices");
			return;
		}

		try {
			const payload = {
				...data,
				clientId: Number(data.clientId),
				projectId: data.projectId ? Number(data.projectId) : null,
				billingCycle: data.invoiceType === "subscription" ? data.billingCycle : null,
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
	const isLoadingDetail = isEditing && invoiceDetailQuery.isLoading;

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
			isLoading={isPending || isLoadingDetail}
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
							placeholder={clientsQuery.isLoading ? "Loading clients…" : "Select a client…"}
							searchPlaceholder="Search clients…"
							options={clientOptions}
							disabled={isPending || clientsQuery.isLoading}
							onValueChange={() => form.setValue("projectId", null)}
						/>
						<FormCombobox
							control={form.control}
							name="projectId"
							label="Project (optional)"
							placeholder={!selectedClientId || Number(selectedClientId) === 0 ? "Select a client first…" : projectsQuery.isLoading ? "Loading projects…" : "Select a project…"}
							searchPlaceholder="Search projects…"
							emptyText="No projects found for this client."
							options={projectOptions}
							disabled={isPending || !selectedClientId || Number(selectedClientId) === 0 || projectsQuery.isLoading}
						/>
					</div>

					{/* ── Dates ── */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<FormSelect
							control={form.control}
							name="invoiceType"
							label="Invoice Type"
							options={[
								{ value: "one_time", label: "Normal invoice" },
								{ value: "subscription", label: "SaaS subscription" },
							]}
							disabled={isPending}
						/>
						{invoiceType === "subscription" ? (
							<FormSelect
								control={form.control}
								name="billingCycle"
								label="Billing Cycle"
								options={[
									{ value: "monthly", label: "Monthly" },
									{ value: "quarterly", label: "Every 3 months" },
									{ value: "semi_annual", label: "Every 6 months" },
									{ value: "annual", label: "Annual" },
								]}
								disabled={isPending}
							/>
						) : (
							<div className="hidden sm:block" />
						)}
					</div>

					{/* ── Dates ── */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<FormDatePicker
							control={form.control}
							name="issueDate"
							label="Issue Date"
							disabled={isPending}
						/>
						<FormDatePicker
							control={form.control}
							name="dueDate"
							label="Due Date"
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
							options={statusOptions}
							disabled={isPending || statusDict.isLoading}
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
