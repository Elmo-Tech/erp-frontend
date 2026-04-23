"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { invoiceApi } from "@/entities/invoice/api/invoice.api";
import { calculateInvoiceTotals } from "@/entities/invoice/model/finance";
import { invoiceKeys } from "@/entities/invoice/model/query-keys";
import { InvoiceStatus, InvoiceStatusLabels, type Invoice, type InvoiceFilters } from "@/entities/invoice/model/types";
import { InvoiceCard } from "@/entities/invoice/ui/InvoiceCard";
import { useInvoicePermissions } from "@/entities/user/model/permissions";
import { useDeleteInvoice, useMarkInvoiceAsPaid } from "@/features/invoices/model/use-invoice-actions";
import { CreateInvoiceForm } from "@/features/invoices/ui/CreateInvoiceForm";
import { DownloadInvoicePdfButton } from "@/features/invoices/ui/DownloadInvoicePdfButton";
import { Button } from "@/shared/ui/button";
import { Pagination } from "@/shared/ui/data-display/Pagination";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { FilterSelect } from "@/shared/ui/filters/FilterSelect";
import { SearchInput } from "@/shared/ui/filters/SearchInput";
import { cn } from "@/shared/lib/utils";
import { InvoiceEmptyState, InvoiceErrorState, InvoiceListHeader, InvoiceRowsSkeleton, InvoiceSummaryStrip } from "./invoice-widget-parts";

interface InvoiceManagementWidgetProps {
	className?: string;
}

const DEFAULT_PER_PAGE = 10;
const STATUS_OPTIONS = Object.values(InvoiceStatus).map((status) => ({
	value: status,
	label: InvoiceStatusLabels[status],
}));

export function InvoiceManagementWidget({ className }: InvoiceManagementWidgetProps) {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
	const { canManageInvoices, canViewInvoices, canCreateInvoices, canEditInvoices, canDeleteInvoices } = useInvoicePermissions();
	const markInvoiceAsPaid = useMarkInvoiceAsPaid();
	const deleteInvoice = useDeleteInvoice();
	const canView = canManageInvoices || canViewInvoices;
	const canCreate = canManageInvoices || canCreateInvoices;
	const canEdit = canManageInvoices || canEditInvoices;
	const canDelete = canManageInvoices || canDeleteInvoices;

	const filters = useMemo<InvoiceFilters>(
		() => ({
			search: search.trim() || undefined,
			status: statusFilter,
			page,
			perPage: DEFAULT_PER_PAGE,
		}),
		[page, search, statusFilter]
	);

	const invoicesQuery = useQuery({
		queryKey: invoiceKeys.list(filters),
		queryFn: () => invoiceApi.getInvoices(filters),
		enabled: canView,
		staleTime: 5 * 60 * 1000,
	});

	const invoices = useMemo(() => invoicesQuery.data?.invoices ?? [], [invoicesQuery.data?.invoices]);
	const pagination = invoicesQuery.data?.pagination;
	const totals = useMemo(() => calculateInvoiceTotals(invoices), [invoices]);

	const handleSearchChange = (value: string) => {
		setPage(1);
		setSearch(value);
	};

	const handleStatusChange = (value: string | undefined) => {
		setPage(1);
		setStatusFilter(value as InvoiceStatus | undefined);
	};

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
				<div className="text-sm text-muted-foreground">Your account cannot view finance records.</div>
			</section>
		);
	}

	return (
		<section className={cn("flex flex-col gap-4", className)}>
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
					<p className="text-sm text-muted-foreground">{pagination ? `${pagination.total} finance records` : "Finance records"}</p>
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

			<div className="flex flex-col gap-3 border-b pb-3 md:flex-row md:items-center md:justify-between">
				<SearchInput
					value={search}
					onChange={handleSearchChange}
					placeholder="Search invoices"
					className="w-full md:max-w-sm"
				/>
				<FilterSelect
					value={statusFilter}
					onChange={handleStatusChange}
					options={STATUS_OPTIONS}
					placeholder="Status"
					allLabel="All statuses"
					className="w-full md:w-44"
				/>
			</div>

			<div className="overflow-hidden rounded-md border bg-background">
				<InvoiceListHeader />
				{invoicesQuery.isLoading ? (
					<InvoiceRowsSkeleton />
				) : invoicesQuery.error ? (
					<InvoiceErrorState message={invoicesQuery.error.message} />
				) : invoices.length === 0 ? (
					<InvoiceEmptyState
						title="No invoices found"
						description="Adjust filters or create a new invoice."
						canCreate={canCreate}
						onCreate={() => setCreateDialogOpen(true)}
					/>
				) : (
					invoices.map((invoice) => (
						<InvoiceCard
							key={invoice.invoiceId}
							invoice={invoice}
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
