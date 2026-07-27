"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormDatePicker } from "@/shared/ui/forms/FormDatePicker";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { useCreateSubscription, useUpdateSubscription } from "@/features/finance/model/use-finance-actions";
import { subscriptionSchema, SUBSCRIPTION_DEFAULT_VALUES, type SubscriptionFormData } from "@/features/finance/model/finance.schema";
import type { Subscription } from "@/entities/finance/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const BILLING_CYCLE_OPTIONS = [
	{ value: "monthly", label: "Monthly" },
	{ value: "yearly", label: "Yearly" },
];

const STATUS_OPTIONS = [
	{ value: "active", label: "Active" },
	{ value: "cancelled", label: "Cancelled" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface SubscriptionFormModalProps {
	open: boolean;
	onClose: () => void;
	editTarget: Subscription | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function SubscriptionFormModal({ open, onClose, editTarget }: SubscriptionFormModalProps) {
	const isEditing = editTarget !== null;
	const createSubscription = useCreateSubscription();
	const updateSubscription = useUpdateSubscription();

	// Cast resolver to bypass z.coerce type mismatch (Zod v4 + @hookform/resolvers v5)
	const form = useForm<SubscriptionFormData>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(subscriptionSchema) as any,
		defaultValues: SUBSCRIPTION_DEFAULT_VALUES,
	});

	// Sync form when modal opens or editTarget changes
	useEffect(() => {
		if (!open) return;

		if (editTarget) {
			form.reset({
				name: editTarget.name,
				provider: editTarget.provider ?? "",
				billingCycle: editTarget.billingCycle,
				cost: editTarget.cost,
				currency: editTarget.currency,
				nextBillingDate: editTarget.nextBillingDate,
				status: editTarget.status,
				notes: editTarget.notes ?? "",
			});
		} else {
			form.reset(SUBSCRIPTION_DEFAULT_VALUES);
		}
	}, [open, editTarget, form]);

	const handleSubmit = async (data: SubscriptionFormData) => {
		try {
			const payload = {
				...data,
				provider: data.provider || null,
				notes: data.notes || null,
			};

			if (isEditing) {
				await updateSubscription.mutateAsync({ id: editTarget.id, payload });
				toast.success("Subscription updated successfully");
			} else {
				await createSubscription.mutateAsync(payload);
				toast.success("Subscription created successfully");
			}
			onClose();
		} catch {
			toast.error(isEditing ? "Failed to update subscription" : "Failed to create subscription");
		}
	};

	const isPending = createSubscription.isPending || updateSubscription.isPending;

	return (
		<FormDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			title={isEditing ? "Edit Subscription" : "Add Subscription"}
			description={isEditing ? "Update the SaaS subscription details." : "Track a new SaaS or recurring subscription."}
			onSubmit={form.handleSubmit(handleSubmit as Parameters<typeof form.handleSubmit>[0])}
			submitLabel={isEditing ? "Save Changes" : "Add Subscription"}
			isLoading={isPending}
			size="lg"
		>
			<Form {...form}>
				<div className="flex flex-col gap-4">
					{/* ── Name & Provider ── */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<FormInput
							control={form.control}
							name="name"
							label="Subscription Name"
							placeholder="e.g. GitHub Teams"
							disabled={isPending}
						/>
						<FormInput
							control={form.control}
							name="provider"
							label="Provider (optional)"
							placeholder="e.g. GitHub"
							disabled={isPending}
						/>
					</div>

					{/* ── Cost & Currency ── */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<FormInput
							control={form.control}
							name="cost"
							label="Cost"
							type="number"
							min={0}
							step="0.01"
							placeholder="0.00"
							disabled={isPending}
						/>
						<FormInput
							control={form.control}
							name="currency"
							label="Currency"
							placeholder="USD"
							disabled={isPending}
						/>
						<FormSelect
							control={form.control}
							name="billingCycle"
							label="Billing Cycle"
							options={BILLING_CYCLE_OPTIONS}
							disabled={isPending}
						/>
					</div>

					{/* ── Next Billing Date & Status ── */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<FormDatePicker
							control={form.control}
							name="nextBillingDate"
							label="Next Billing Date"
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

					{/* ── Notes ── */}
					<FormTextarea
						control={form.control}
						name="notes"
						label="Notes (optional)"
						placeholder="Any additional notes about this subscription…"
						rows={3}
						disabled={isPending}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
