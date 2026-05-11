"use client";

import { useState } from "react";
import { Receipt, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Can } from "@/shared/ui/Can";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { PayrollTransactionFormModal } from "@/features/hr/ui/PayrollTransactionFormModal";
import { usePayrollTransactions, useDeletePayrollTransaction } from "@/features/hr/model/use-hr-actions";
import type { PayrollTransaction, PayrollTransactionType } from "@/entities/hr/model/types";
import { PAYROLL_TRANSACTION_TYPE_LABELS } from "@/entities/hr/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format(amount);
}

const TYPE_VARIANT: Record<PayrollTransactionType, "default" | "destructive"> = {
	manual_bonus: "default",
	manual_deduction: "destructive",
};

// ─────────────────────────────────────────────────────────────────────────────
// Column definitions
// ─────────────────────────────────────────────────────────────────────────────

function buildColumns(onEdit: (tx: PayrollTransaction) => void, onDelete: (tx: PayrollTransaction) => void): Column<PayrollTransaction>[] {
	return [
		{
			key: "employee",
			header: "Employee",
			render: (tx) => (
				<div className="min-w-0">
					<p className="truncate text-sm font-medium">{tx.user?.name ?? "—"}</p>
					<p className="truncate text-xs text-muted-foreground">{tx.user?.email ?? "—"}</p>
				</div>
			),
		},
		{
			key: "type",
			header: "Type",
			render: (tx) => (
				<Badge
					variant={TYPE_VARIANT[tx.type]}
					className="text-xs"
				>
					{PAYROLL_TRANSACTION_TYPE_LABELS[tx.type]}
				</Badge>
			),
		},
		{
			key: "amount",
			header: "Amount",
			className: "text-right",
			render: (tx) => (
				<span className={`text-sm font-semibold tabular-nums ${tx.type === "manual_bonus" ? "text-green-600" : "text-destructive"}`}>
					{tx.type === "manual_bonus" ? "+" : "-"}
					{formatCurrency(tx.amount)}
				</span>
			),
		},
		{
			key: "date",
			header: "Date",
			render: (tx) => <span className="text-sm tabular-nums text-muted-foreground">{tx.transactionDate}</span>,
		},
		{
			key: "reason",
			header: "Reason",
			render: (tx) => <span className="text-xs text-muted-foreground line-clamp-1 max-w-48">{tx.reason}</span>,
		},
		{
			key: "actions",
			header: "",
			className: "text-right",
			render: (tx) => (
				<Can permission="manage_payroll">
					<div className="flex items-center justify-end gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={(e) => {
								e.stopPropagation();
								onEdit(tx);
							}}
						>
							<Pencil className="h-3.5 w-3.5" />
							<span className="sr-only">Edit</span>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-destructive hover:text-destructive"
							onClick={(e) => {
								e.stopPropagation();
								onDelete(tx);
							}}
						>
							<Trash2 className="h-3.5 w-3.5" />
							<span className="sr-only">Delete</span>
						</Button>
					</div>
				</Can>
			),
		},
	];
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget
// ─────────────────────────────────────────────────────────────────────────────

export function PayrollTransactionsWidget() {
	const { data, isLoading, error } = usePayrollTransactions();
	const deleteTransaction = useDeletePayrollTransaction();

	const [formOpen, setFormOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<PayrollTransaction | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<PayrollTransaction | null>(null);

	const transactions = data?.data ?? [];

	const handleCreate = () => {
		setEditTarget(null);
		setFormOpen(true);
	};

	const handleEdit = (tx: PayrollTransaction) => {
		setEditTarget(tx);
		setFormOpen(true);
	};

	const handleCloseForm = () => {
		setFormOpen(false);
		setEditTarget(null);
	};

	const handleDeleteConfirm = async () => {
		if (!deleteTarget) return;
		try {
			await deleteTransaction.mutateAsync(deleteTarget.id);
			toast.success("Transaction deleted");
			setDeleteTarget(null);
		} catch {
			toast.error("Failed to delete transaction");
		}
	};

	const columns = buildColumns(handleEdit, setDeleteTarget);

	return (
		<section className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">Manual Transactions</h1>
					<p className="text-sm text-muted-foreground">Record manual bonuses and deductions outside the regular payroll cycle.</p>
				</div>
				<Can permission="manage_payroll">
					<Button
						size="sm"
						className="gap-2 shrink-0"
						onClick={handleCreate}
					>
						<Plus className="h-4 w-4" />
						New Transaction
					</Button>
				</Can>
			</div>

			<DataTable<PayrollTransaction>
				title="All Manual Transactions"
				titleBadge={transactions.length > 0 ? String(transactions.length) : undefined}
				columns={columns}
				data={transactions}
				keyExtractor={(tx) => tx.id}
				isLoading={isLoading}
				error={error}
				emptyState={{
					icon: Receipt,
					title: "No manual transactions",
					description: "No manual bonuses or deductions have been recorded yet.",
					action: { label: "New Transaction", onClick: handleCreate },
				}}
			/>

			<PayrollTransactionFormModal
				open={formOpen}
				onClose={handleCloseForm}
				editTarget={editTarget}
			/>

			<ConfirmDialog
				open={deleteTarget !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				title="Delete Transaction"
				description="Delete this transaction? This action cannot be undone."
				confirmLabel="Delete"
				variant="destructive"
				isLoading={deleteTransaction.isPending}
				onConfirm={handleDeleteConfirm}
			/>
		</section>
	);
}
