"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { invoiceApi } from "@/entities/invoice/api/invoice.api";
import { calculateInvoiceTotals } from "@/entities/invoice/model/finance";
import { invoiceKeys } from "@/entities/invoice/model/query-keys";
import type { Invoice, InvoiceFilters } from "@/entities/invoice/model/types";
import { InvoiceCard } from "@/entities/invoice/ui/InvoiceCard";
import { useInvoicePermissions } from "@/entities/user/model/permissions";
import { useDeleteInvoice, useMarkInvoiceAsPaid } from "@/features/invoices/model/use-invoice-actions";
import { CreateInvoiceForm } from "@/features/invoices/ui/CreateInvoiceForm";
import { DownloadInvoicePdfButton } from "@/features/invoices/ui/DownloadInvoicePdfButton";
import { Button } from "@/shared/ui/button";
import { Pagination } from "@/shared/ui/data-display/Pagination";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { cn } from "@/shared/lib/utils";
import { InvoiceEmptyState, InvoiceErrorState, InvoiceListHeader, InvoiceRowsSkeleton, InvoiceSummaryStrip } from "./invoice-widget-parts";

interface ProjectInvoicesWidgetProps {
	projectId: number;
	projectTitle?: string;
	className?: string;
}

const DEFAULT_PER_PAGE = 10;

export function ProjectInvoicesWidget({ projectId, projectTitle, className }: ProjectInvoicesWidgetProps) {
	const [page, setPage] = useState(1);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
	const { canManageInvoices, canViewInvoices, canCreateInvoices, canEditInvoices, canDeleteInvoices } = useInvoicePermissions();
	const markInvoiceAsPaid = useMarkInvoiceAsPaid();
	const deleteInvoice = useDeleteInvoice();
	const canView = canManageInvoices || canViewInvoices;
	const canCreate = canManageInvoices || canCreateInvoices;
	const canEdit = canManageInvoices || canEditInvoices;
	const canDelete = canManageInvoices || canDeleteInvoices;
	const filters = useMemo<InvoiceFilters>(() => ({ projectId, page, perPage: DEFAULT_PER_PAGE }), [page, projectId]);

	const invoicesQuery = useQuery({
		queryKey: invoiceKeys.list(filters),
		queryFn: () => invoiceApi.getInvoices(filters),
		enabled: canView && Boolean(projectId),
		staleTime: 5 * 60 * 1000,
	});

	const invoices = useMemo(() => invoicesQuery.data?.invoices ?? [], [invoicesQuery.data?.invoices]);
	const pagination = invoicesQuery.data?.pagination;
	const totals = useMemo(() => calculateInvoiceTotals(invoices), [invoices]);

	const handleMarkPaid = async (invoice: Invoice) => {
		try {
			await markInvoiceAsPaid.mutateAsync(invoice.invoiceId);
			toast.success("Invoice marked as paid");
		} catch {
			toast.error("Failed to update invoice");
		}
	};

	const handleConfirmDelete = async () => {
		if (!invoiceToDelete) {
			return;
		}

		try {
			await deleteInvoice.mutateAsync({ id: invoiceToDelete.invoiceId, projectId: invoiceToDelete.projectId });
			toast.success("Invoice deleted");
			setInvoiceToDelete(null);
		} catch {
			toast.error("Failed to delete invoice");
		}
	};

	if (!canView) {
		return (
			<section className={cn("flex min-h-48 flex-col items-center justify-center rounded-md border px-4 text-center", className)}>
				<div className="text-sm font-medium">Invoices are restricted</div>
				<div className="text-sm text-muted-foreground">Your account cannot view project finance records.</div>
			</section>
		);
	}

	return (
		<section className={cn("flex flex-col gap-4", className)}>
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h2 className="text-lg font-semibold tracking-tight">Invoices</h2>
					<p className="text-sm text-muted-foreground">{pagination ? `${pagination.total} invoices linked to this project` : "Project finance records"}</p>
				</div>

				{canCreate && (
					<Button
						size="sm"
						onClick={() => setCreateDialogOpen(true)}
					>
						<Plus data-icon="inline-start" />
						New invoice
					</Button>
				)}
			</div>

			<InvoiceSummaryStrip totals={totals} />

			<div className="overflow-hidden rounded-md border bg-background">
				<InvoiceListHeader />
				{invoicesQuery.isLoading ? (
					<InvoiceRowsSkeleton />
				) : invoicesQuery.error ? (
					<InvoiceErrorState message={invoicesQuery.error.message} />
				) : invoices.length === 0 ? (
					<InvoiceEmptyState
						title="No invoices yet"
						description="Create the first invoice for this project."
						canCreate={canCreate}
						onCreate={() => setCreateDialogOpen(true)}
					/>
				) : (
					invoices.map((invoice) => (
						<InvoiceCard
							key={invoice.invoiceId}
							invoice={invoice}
							projectLabel={projectTitle}
							downloadAction={
								<DownloadInvoicePdfButton
									invoiceId={invoice.invoiceId}
									invoiceNumber={invoice.invoiceNumber}
								/>
							}
							onMarkPaid={canEdit ? handleMarkPaid : undefined}
							onDelete={canDelete ? setInvoiceToDelete : undefined}
						/>
					))
				)}
			</div>

			{pagination && pagination.totalPages > 1 && (
				<Pagination
					pagination={pagination}
					onPageChange={setPage}
				/>
			)}

			<CreateInvoiceForm
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				projectId={projectId}
				projectTitle={projectTitle}
			/>

			<ConfirmDialog
				open={Boolean(invoiceToDelete)}
				onOpenChange={(open) => {
					if (!open) {
						setInvoiceToDelete(null);
					}
				}}
				title="Delete invoice"
				description={
					<span>
						Delete <span className="font-medium text-foreground">{invoiceToDelete?.invoiceNumber || `invoice #${invoiceToDelete?.invoiceId}`}</span>? This action cannot be undone.
					</span>
				}
				confirmLabel="Delete"
				variant="destructive"
				onConfirm={handleConfirmDelete}
				isLoading={deleteInvoice.isPending}
			/>
		</section>
	);
}
