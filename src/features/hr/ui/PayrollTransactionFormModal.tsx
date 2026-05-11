"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormCombobox } from "@/shared/ui/forms/FormCombobox";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { useGetInternalUsers } from "@/entities/user/api/user.api";
import { useCreatePayrollTransaction, useUpdatePayrollTransaction } from "../model/use-hr-actions";
import { payrollTransactionSchema, PAYROLL_TRANSACTION_DEFAULT_VALUES, type PayrollTransactionFormData } from "../model/hr.schema";
import type { PayrollTransaction } from "@/entities/hr/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Static option lists
// ─────────────────────────────────────────────────────────────────────────────

const TRANSACTION_TYPE_OPTIONS = [
	{ value: "manual_bonus", label: "Manual Bonus" },
	{ value: "manual_deduction", label: "Manual Deduction" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface PayrollTransactionFormModalProps {
	open: boolean;
	onClose: () => void;
	/** null = create mode, PayrollTransaction = edit mode */
	editTarget: PayrollTransaction | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PayrollTransactionFormModal({ open, onClose, editTarget }: PayrollTransactionFormModalProps) {
	const isEditing = editTarget !== null;
	const createTransaction = useCreatePayrollTransaction();
	const updateTransaction = useUpdatePayrollTransaction();

	const usersQuery = useGetInternalUsers(open);
	const employeeOptions = useMemo(
		() =>
			(usersQuery.data?.users ?? []).map((u) => ({
				value: String(u.id),
				label: u.name,
				description: u.email,
			})),
		[usersQuery.data],
	);

	const form = useForm<PayrollTransactionFormData>({
		resolver: zodResolver(payrollTransactionSchema),
		defaultValues: PAYROLL_TRANSACTION_DEFAULT_VALUES,
	});

	useEffect(() => {
		if (!open) return;
		if (editTarget) {
			form.reset({
				user_id: editTarget.userId,
				amount: editTarget.amount,
				type: editTarget.type,
				reason: editTarget.reason,
				transaction_date: editTarget.transactionDate,
			});
		} else {
			form.reset(PAYROLL_TRANSACTION_DEFAULT_VALUES);
		}
	}, [open, editTarget, form]);

	const isPending = createTransaction.isPending || updateTransaction.isPending;

	const handleSubmit = async (data: PayrollTransactionFormData) => {
		try {
			if (isEditing) {
				await updateTransaction.mutateAsync({
					id: editTarget.id,
					payload: {
						amount: data.amount,
						type: data.type,
						reason: data.reason,
						transaction_date: data.transaction_date,
					},
				});
				toast.success("Transaction updated successfully");
			} else {
				await createTransaction.mutateAsync({
					user_id: data.user_id,
					amount: data.amount,
					type: data.type,
					reason: data.reason,
					transaction_date: data.transaction_date,
				});
				toast.success("Transaction created successfully");
			}
			onClose();
		} catch {
			toast.error(isEditing ? "Failed to update transaction" : "Failed to create transaction");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			title={isEditing ? "Edit Transaction" : "New Manual Transaction"}
			description={isEditing ? "Update the transaction details." : "Record a manual bonus or deduction for an employee."}
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel={isEditing ? "Save Changes" : "Create Transaction"}
			isLoading={isPending}
			size="lg"
		>
			<Form {...form}>
				<div className="flex flex-col gap-4">
					{/* Employee — locked in edit mode */}
					<FormCombobox
						control={form.control}
						name="user_id"
						label="Employee"
						placeholder={usersQuery.isLoading ? "Loading employees…" : "Select employee…"}
						searchPlaceholder="Search employees…"
						emptyText="No employee found."
						options={employeeOptions}
						disabled={isPending || usersQuery.isLoading || isEditing}
						description={isEditing ? "Employee cannot be changed after creation." : undefined}
					/>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<FormSelect
							control={form.control}
							name="type"
							label="Transaction Type"
							placeholder="Select type…"
							options={TRANSACTION_TYPE_OPTIONS}
							disabled={isPending}
						/>
						<FormInput
							control={form.control}
							name="amount"
							label="Amount"
							type="number"
							placeholder="0.00"
							min={0.01}
							step={0.01}
							disabled={isPending}
						/>
					</div>

					<FormInput
						control={form.control}
						name="transaction_date"
						label="Transaction Date"
						type="date"
						disabled={isPending}
					/>

					<FormTextarea
						control={form.control}
						name="reason"
						label="Reason"
						placeholder="Describe the reason for this transaction…"
						rows={3}
						disabled={isPending}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
