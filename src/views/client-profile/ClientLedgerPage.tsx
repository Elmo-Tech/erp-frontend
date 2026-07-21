"use client";

import { FileText, Loader2, Pencil, Plus, ReceiptText, Send, Trash2, WalletCards } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useClientProfile } from "@/widgets/client-management/model/client-profile.context";
import { useInvoices, useSendInvoice } from "@/features/finance/model/use-finance-actions";
import { InvoiceFormModal } from "@/features/finance/ui/InvoiceFormModal";
import { DeleteInvoiceDialog } from "@/features/finance/ui/DeleteInvoiceDialog";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useInvoicePermissions } from "@/entities/user/model/permissions";
import { formatCurrency } from "@/shared/lib/formatters";
import { formatDate } from "@/shared/lib/dateUtils";
import type { Invoice, InvoiceStatus } from "@/entities/finance/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<InvoiceStatus, "default" | "secondary" | "destructive" | "outline"> = {
	draft: "secondary",
	sent: "default",
	paid: "outline",
	overdue: "destructive",
};

function buildColumns(
	onEdit: (inv: Invoice) => void,
	onDelete: (inv: Invoice) => void,
	onSend: (inv: Invoice) => void,
	permissions: { canEdit: boolean; canDelete: boolean; canSend: boolean; isSending: boolean },
): Column<Invoice>[] {
	return [
		{
			key: "invoiceNumber",
			header: "Invoice #",
			render: (inv) => <span className="font-mono text-sm font-medium">{inv.invoiceNumber}</span>,
		},
		{
			key: "issueDate",
			header: "Issue Date",
			render: (inv) => <span className="text-sm text-muted-foreground">{formatDate(inv.issueDate)}</span>,
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
				<div className="flex items-center justify-end gap-1">
					{permissions.canSend && inv.status === "draft" && (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-primary hover:text-primary"
							disabled={permissions.isSending}
							onClick={(event) => {
								event.stopPropagation();
								onSend(inv);
							}}
						>
							<Send className="h-3.5 w-3.5" />
							<span className="sr-only">Send {inv.invoiceNumber}</span>
						</Button>
					)}
					{permissions.canEdit && (
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
					)}
					{permissions.canDelete && (
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
					)}
				</div>
			),
		},
	];
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ClientLedgerPage() {
	const { canCreateInvoices, canEditInvoices, canDeleteInvoices, canSendInvoices } = useInvoicePermissions();
	const sendInvoice = useSendInvoice();
	const client = useClientProfile();
	const { data, isLoading, error } = useInvoices({ clientId: client.clientId });
	const invoices = data?.data ?? [];

	const [formOpen, setFormOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<Invoice | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);

	const handleCreate = () => {
		setEditTarget(null);
		setFormOpen(true);
	};

	const handleEdit = (inv: Invoice) => {
		setEditTarget(inv);
		setFormOpen(true);
	};

	const handleCloseForm = () => {
		setFormOpen(false);
		setEditTarget(null);
	};

	// ── Derived ledger stats ──────────────────────────────────────────────────
	const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
	const totalPaid = invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.totalAmount, 0);
	const outstanding = invoices.filter((inv) => inv.status === "sent" || inv.status === "overdue").reduce((sum, inv) => sum + inv.totalAmount, 0);

	const LEDGER_STATS = [
		{ label: "Total Invoiced", value: totalInvoiced, icon: ReceiptText },
		{ label: "Total Paid", value: totalPaid, icon: WalletCards },
		{ label: "Outstanding", value: outstanding, icon: FileText },
	];

	const handleSend = async (invoice: Invoice) => {
		if (!canSendInvoices) return;
		try {
			await sendInvoice.mutateAsync(invoice.id);
			toast.success(`Invoice ${invoice.invoiceNumber} sent`);
		} catch {
			toast.error("Failed to send invoice");
		}
	};

	const columns = buildColumns(handleEdit, setDeleteTarget, handleSend, {
		canEdit: canEditInvoices,
		canDelete: canDeleteInvoices,
		canSend: canSendInvoices,
		isSending: sendInvoice.isPending,
	});

	return (
		<section className="flex flex-col gap-4">
			{/* ── Stats ─────────────────────────────────────────────────────── */}
			<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
				{LEDGER_STATS.map((stat) => {
					const Icon = stat.icon;
					return (
						<div
							key={stat.label}
							className="rounded-md border bg-background p-4"
						>
							<div className="flex items-center justify-between gap-3">
								<div className="space-y-1">
									<div className="text-sm text-muted-foreground">{stat.label}</div>
									<div className="text-2xl font-semibold tracking-tight">{isLoading ? <Loader2 className="size-5 animate-spin text-muted-foreground" /> : formatCurrency(stat.value)}</div>
								</div>
								<div className="flex size-10 items-center justify-center rounded-md border bg-muted/30 text-muted-foreground">
									<Icon className="size-5" />
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* ── Invoice table ─────────────────────────────────────────────── */}
			<div className="flex items-center justify-between">
				<p className="text-sm font-medium text-muted-foreground">Invoice history for this client</p>
				{canCreateInvoices && (
					<Button
						size="sm"
						className="gap-2"
						onClick={handleCreate}
					>
						<Plus className="h-4 w-4" />
						New Invoice
					</Button>
				)}
			</div>

			<DataTable<Invoice>
				title="Invoices"
				titleBadge={data ? String(invoices.length) : undefined}
				columns={columns}
				data={invoices}
				keyExtractor={(inv) => inv.id}
				isLoading={isLoading}
				error={error}
				emptyState={{
					icon: ReceiptText,
					title: "No invoices yet",
					description: "Client invoices and payment records will appear here.",
					action: canCreateInvoices ? { label: "New Invoice", onClick: handleCreate } : undefined,
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
