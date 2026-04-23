"use client";

import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { invoiceApi } from "@/entities/invoice/api/invoice.api";
import { calculateInvoiceTotals } from "@/entities/invoice/model/finance";
import { invoiceKeys } from "@/entities/invoice/model/query-keys";
import type { Invoice } from "@/entities/invoice/model/types";
import { InvoiceCard } from "@/entities/invoice/ui/InvoiceCard";
import { useInvoicePermissions } from "@/entities/user/model/permissions";
import { useDeleteInvoice, useMarkInvoiceAsPaid } from "@/features/invoices/model/use-invoice-actions";
import { CreateInvoiceForm } from "@/features/invoices/ui/CreateInvoiceForm";
import { DownloadInvoicePdfButton } from "@/features/invoices/ui/DownloadInvoicePdfButton";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { cn } from "@/shared/lib/utils";
import { InvoiceEmptyState, InvoiceErrorState, InvoiceListHeader, InvoiceRowsSkeleton, InvoiceSummaryStrip } from "./invoice-widget-parts";

interface ClientProjectOption {
	projectId: number;
	title: string;
}

interface ClientInvoicesWidgetProps {
	clientId: number;
	projects: ClientProjectOption[];
	className?: string;
}

const CLIENT_PROJECT_INVOICES_PER_PAGE = 100;

export function ClientInvoicesWidget({ clientId, projects, className }: ClientInvoicesWidgetProps) {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
	const { canManageInvoices, canViewInvoices, canCreateInvoices, canEditInvoices, canDeleteInvoices } = useInvoicePermissions();
	const markInvoiceAsPaid = useMarkInvoiceAsPaid(clientId);
	const deleteInvoice = useDeleteInvoice(clientId);
	const canView = canManageInvoices || canViewInvoices;
	const canCreate = (canManageInvoices || canCreateInvoices) && projects.length > 0;
	const canEdit = canManageInvoices || canEditInvoices;
	const canDelete = canManageInvoices || canDeleteInvoices;

	const projectLabelById = useMemo(() => new Map(projects.map((project) => [project.projectId, project.title])), [projects]);
	const invoiceQueries = useQueries({
		queries: projects.map((project) => ({
			queryKey: invoiceKeys.list({ projectId: project.projectId, perPage: CLIENT_PROJECT_INVOICES_PER_PAGE }),
			queryFn: () => invoiceApi.getInvoices({ projectId: project.projectId, perPage: CLIENT_PROJECT_INVOICES_PER_PAGE }),
			enabled: canView && Boolean(project.projectId),
			staleTime: 5 * 60 * 1000,
		})),
	});

	const invoices = invoiceQueries
		.flatMap((query) => query.data?.invoices ?? [])
		.sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
	const totals = useMemo(() => calculateInvoiceTotals(invoices), [invoices]);
	const isLoading = invoiceQueries.some((query) => query.isLoading);
	const firstError = invoiceQueries.find((query) => query.error)?.error;
	const errorMessage = firstError instanceof Error ? firstError.message : undefined;

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
				<div className="text-sm text-muted-foreground">Your account cannot view client finance records.</div>
			</section>
		);
	}

	return (
		<section className={cn("flex flex-col gap-4", className)}>
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h2 className="text-lg font-semibold tracking-tight">Invoices</h2>
					<p className="text-sm text-muted-foreground">{projects.length > 0 ? `${invoices.length} invoices across ${projects.length} projects` : "Client has no projects yet"}</p>
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
				{isLoading ? (
					<InvoiceRowsSkeleton />
				) : firstError && invoices.length === 0 ? (
					<InvoiceErrorState message={errorMessage} />
				) : projects.length === 0 ? (
					<InvoiceEmptyState
						title="No projects yet"
						description="Invoices can be created once this client has a project."
					/>
				) : invoices.length === 0 ? (
					<InvoiceEmptyState
						title="No invoices yet"
						description="Create the first invoice for this client."
						canCreate={canCreate}
						onCreate={() => setCreateDialogOpen(true)}
					/>
				) : (
					invoices.map((invoice) => (
						<InvoiceCard
							key={invoice.invoiceId}
							invoice={invoice}
							projectLabel={projectLabelById.get(invoice.projectId)}
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

			<CreateInvoiceForm
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				clientId={clientId}
				projectOptions={projects}
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
