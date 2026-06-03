"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Can, usePermissionGate } from "@/shared/ui/Can";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { FilterSelect } from "@/shared/ui/filters/FilterSelect";
import { Input } from "@/shared/ui/input";
import { InvoiceFormModal } from "@/features/finance/ui/InvoiceFormModal";
import { DeleteInvoiceDialog } from "@/features/finance/ui/DeleteInvoiceDialog";
import { useInvoices } from "@/features/finance/model/use-finance-actions";
import { clientApi } from "@/entities/client/api/client.api";
import { clientKeys } from "@/entities/client/model/query-keys";
import { projectApi } from "@/entities/project/api/project.api";
import { projectKeys } from "@/entities/project/model/query-keys";
import type { FinanceFilters, Invoice, InvoiceStatus } from "@/entities/finance/model/types";
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
			render: (inv) => <span className="text-sm">{inv.client?.displayName ?? inv.client?.name ?? `Client #${inv.clientId}`}</span>,
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
	const { can } = usePermissionGate();
	const [filters, setFilters] = useState<FinanceFilters>({});
	const { data, isLoading, error } = useInvoices(filters);
	const invoices = data?.data ?? [];
	const canManageInvoices = can("manage_invoices");
	const clientsQuery = useQuery({ queryKey: clientKeys.list({ perPage: 100 }), queryFn: () => clientApi.getClients({ perPage: 100 }), staleTime: 5 * 60 * 1000 });
	const projectsQuery = useQuery({ queryKey: projectKeys.list({ perPage: 100 }), queryFn: () => projectApi.getProjects({ perPage: 100 }), staleTime: 5 * 60 * 1000 });

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
	const clientOptions = useMemo(() => (clientsQuery.data?.clients ?? []).map((client) => ({ value: String(client.id), label: client.display_name })), [clientsQuery.data?.clients]);
	const projectOptions = useMemo(() => (projectsQuery.data?.projects ?? []).map((project) => ({ value: String(project.projectId), label: project.title })), [projectsQuery.data?.projects]);

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

			<div className="grid gap-3 border-y py-3 md:grid-cols-2 xl:grid-cols-5">
				<FilterSelect value={filters.status} onChange={(status) => setFilters((current) => ({ ...current, status }))} options={Object.keys(STATUS_VARIANT).map((status) => ({ value: status, label: status }))} allLabel="All statuses" className="w-full" />
				<FilterSelect value={filters.clientId ? String(filters.clientId) : undefined} onChange={(clientId) => setFilters((current) => ({ ...current, clientId: clientId ? Number(clientId) : undefined }))} options={clientOptions} allLabel="All clients" className="w-full" disabled={clientsQuery.isLoading} />
				<FilterSelect value={filters.projectId ? String(filters.projectId) : undefined} onChange={(projectId) => setFilters((current) => ({ ...current, projectId: projectId ? Number(projectId) : undefined }))} options={projectOptions} allLabel="All projects" className="w-full" disabled={projectsQuery.isLoading} />
				<Input type="date" value={filters.from ?? ""} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value || undefined }))} aria-label="Invoice due from" />
				<Input type="date" value={filters.to ?? ""} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value || undefined }))} aria-label="Invoice due to" />
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
					action: canManageInvoices ? { label: "New Invoice", onClick: handleCreate } : undefined,
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
