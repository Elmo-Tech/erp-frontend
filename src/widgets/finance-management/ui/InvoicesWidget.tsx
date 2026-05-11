"use client";

import { useState } from "react";
import { FileText, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Can } from "@/shared/ui/Can";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { InvoiceFormModal } from "@/features/finance/ui/InvoiceFormModal";
import { DeleteInvoiceDialog } from "@/features/finance/ui/DeleteInvoiceDialog";
import { useInvoices } from "@/features/finance/model/use-finance-actions";
import type { Invoice, InvoiceStatus } from "@/entities/finance/model/types";
import { formatCurrency } from "@/shared/lib/formatters";
import { formatDate } from "@/shared/lib/dateUtils";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<InvoiceStatus, "default" | "secondary" | "destructive" | "outline"> = {
	draft: "secondary",
	sent: "default",
	paid: "outline",
	overdue: "destructive",
};

// ─────────────────────────────────────────────────────────────────────────────
// Column definitions
// ─────────────────────────────────────────────────────────────────────────────

function buildColumns(onEdit: (invoice: Invoice) => void, onDelete: (invoice: Invoice) => void): Column<Invoice>[] {
	return [
		{
			key: "invoiceNumber",
			header: "Invoice #",
			render: (inv) => <span className="text-sm font-mono font-medium">{inv.invoiceNumber}</span>,
		},
		{
			key: "client",
			header: "Client",
			render: (inv) => <span className="text-sm">{inv.client?.name ?? `Client #${inv.clientId}`}</span>,
		},
		{
			key: "dueDate",
			header: "Due Date",
			render: (inv) => <span className="text-sm text-muted-foreground">{formatDate(inv.dueDate)}</span>,
		},
		{
			key: "totalAmount",
			header: "Total",
			className: "text-right",
			render: (inv) => <span className="text-sm font-semibold tabular-nums">{formatCurrency(inv.totalAmount)}</span>,
		},
		{
			key: "status",
			header: "Status",
			render: (inv) => (
				<Badge
					variant={STATUS_VARIANT[inv.status]}
					className="capitalize text-xs"
				>
					{inv.status}
				</Badge>
			),
		},
		{
			key: "actions",
			header: "",
			className: "text-right",
			render: (inv) => (
				<Can permission="manage_invoices">
					<div className="flex items-center justify-end gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={(e) => {
								e.stopPropagation();
								onEdit(inv);
							}}
						>
							<Pencil className="h-3.5 w-3.5" />
							<span className="sr-only">Edit {inv.invoiceNumber}</span>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-destructive hover:text-destructive"
							onClick={(e) => {
								e.stopPropagation();
								onDelete(inv);
							}}
						>
							<Trash2 className="h-3.5 w-3.5" />
							<span className="sr-only">Delete {inv.invoiceNumber}</span>
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

export function InvoicesWidget() {
	const { data, isLoading, error } = useInvoices();
	const invoices = data?.data ?? [];

	const [formOpen, setFormOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<Invoice | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);

	const handleCreate = () => {
		setEditTarget(null);
		setFormOpen(true);
	};

	const handleEdit = (invoice: Invoice) => {
		setEditTarget(invoice);
		setFormOpen(true);
	};

	const handleCloseForm = () => {
		setFormOpen(false);
		setEditTarget(null);
	};

	const columns = buildColumns(handleEdit, setDeleteTarget);

	return (
		<section className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
					<p className="text-sm text-muted-foreground">Create and manage client invoices with line items, tax, and discounts.</p>
				</div>
				<Can permission="manage_invoices">
					<Button
						size="sm"
						className="gap-2 shrink-0"
						onClick={handleCreate}
					>
						<Plus className="h-4 w-4" />
						New Invoice
					</Button>
				</Can>
			</div>

			<DataTable<Invoice>
				title="All Invoices"
				titleBadge={data ? String(invoices.length) : undefined}
				columns={columns}
				data={invoices}
				keyExtractor={(inv) => inv.id}
				isLoading={isLoading}
				error={error}
				emptyState={{
					icon: FileText,
					title: "No invoices yet",
					description: "Create your first invoice to start billing clients.",
					action: { label: "New Invoice", onClick: handleCreate },
				}}
			/>

			<InvoiceFormModal
				open={formOpen}
				onClose={handleCloseForm}
				editTarget={editTarget}
			/>

			<DeleteInvoiceDialog
				open={deleteTarget !== null}
				onClose={() => setDeleteTarget(null)}
				invoice={deleteTarget}
			/>
		</section>
	);
}
