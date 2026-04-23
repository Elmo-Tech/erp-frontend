"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { DataTable } from "@/shared/ui/data-display/DataTable";
import { FilterSelect, FilterOption } from "@/shared/ui/filters/FilterSelect";
import { FilterBar } from "@/shared/ui/filters/FilterBar";
import { Receipt, AlertCircle, CreditCard, DollarSign, Filter } from "lucide-react";
import { useClientInvoices, usePayInvoice } from "../hooks/useClientInvoices";
import { ClientInvoice, InvoiceStatus } from "../types/clientInvoice";
import { getInvoicesColumns } from "./columns/invoicesColumns";
import { formatCurrency } from "@/shared/lib/formatters";
import { toast } from "sonner";

/**
 * ClientInvoiceList component for displaying invoices in table format.
 * Supports filtering by status and displays total outstanding amount.
 *
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6 - Display invoices with filtering and outstanding amount
 */
export const ClientInvoiceList: React.FC = () => {
	const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
	const [payingInvoiceId, setPayingInvoiceId] = useState<number | null>(null);
	const [page, setPage] = useState(1);

	const { data: invoicesData, isLoading, error } = useClientInvoices(statusFilter ? { status: statusFilter, page, perPage: 10 } : { page, perPage: 10 });
	const payInvoiceMutation = usePayInvoice();

	// Calculate total outstanding amount
	const outstandingAmount = useMemo(() => {
		if (!invoicesData?.invoices) return 0;
		return invoicesData.invoices.filter((inv) => inv.isPayable).reduce((sum, inv) => sum + inv.amount, 0);
	}, [invoicesData?.invoices]);

	// Count by status
	const statusCounts = useMemo(() => {
		if (!invoicesData?.invoices) return { overdue: 0, pending: 0, paid: 0 };
		return {
			overdue: invoicesData.invoices.filter((inv) => inv.isOverdue).length,
			pending: invoicesData.invoices.filter((inv) => inv.status === "sent" && !inv.isOverdue).length,
			paid: invoicesData.invoices.filter((inv) => inv.status === "paid").length,
		};
	}, [invoicesData?.invoices]);

	const handlePayInvoice = async (invoice: ClientInvoice) => {
		setPayingInvoiceId(invoice.invoiceId);
		try {
			await payInvoiceMutation.mutateAsync(invoice.invoiceId);
			toast.success("Payment successful!", {
				description: `Invoice ${invoice.invoiceNumber} has been marked as paid.`,
			});
		} catch (error) {
			toast.error("Payment failed", {
				description: error instanceof Error ? error.message : "Please try again later.",
			});
		} finally {
			setPayingInvoiceId(null);
		}
	};

	const handleStatusChange = (value: string | undefined) => {
		setStatusFilter(value);
		setPage(1);
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	// Status filter options
	const statusOptions: FilterOption[] = [
		{ value: InvoiceStatus.SENT, label: "Pending" },
		{ value: InvoiceStatus.OVERDUE, label: "Overdue" },
		{ value: InvoiceStatus.PAID, label: "Paid" },
		{ value: InvoiceStatus.CANCELLED, label: "Cancelled" },
	];

	// Get columns with handlers
	const columns = getInvoicesColumns({
		onPayInvoice: handlePayInvoice,
		payingInvoiceId,
	});

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				{/* Outstanding Amount */}
				<Card className={statusCounts.overdue > 0 ? "border-red-200" : ""}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-24" />
						) : (
							<>
								<div className="text-2xl font-bold">{formatCurrency(outstandingAmount)}</div>
								{statusCounts.overdue > 0 && (
									<p className="text-xs text-red-600 flex items-center gap-1 mt-1">
										<AlertCircle className="h-3 w-3" />
										{statusCounts.overdue} overdue
									</p>
								)}
							</>
						)}
					</CardContent>
				</Card>

				{/* Pending Invoices */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
						<Receipt className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>{isLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{statusCounts.pending}</div>}</CardContent>
				</Card>

				{/* Paid Invoices */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
						<CreditCard className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>{isLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{statusCounts.paid}</div>}</CardContent>
				</Card>
			</div>

			{/* Invoices Table */}
			<DataTable
				title="All Invoices"
				titleBadge={invoicesData?.pagination ? `${invoicesData.pagination.total} invoices` : undefined}
				columns={columns}
				data={invoicesData?.invoices || []}
				keyExtractor={(invoice) => invoice.invoiceId}
				isLoading={isLoading}
				error={error}
				pagination={invoicesData?.pagination}
				onPageChange={handlePageChange}
				emptyState={{
					icon: Receipt,
					title: statusFilter ? `No invoices with status "${statusFilter}" found` : "No Invoices Found",
					description: "You don't have any invoices yet.",
				}}
				headerActions={
					<FilterBar>
						<FilterSelect
							value={statusFilter}
							onChange={handleStatusChange}
							options={statusOptions}
							placeholder="All Statuses"
							icon={Filter}
						/>
					</FilterBar>
				}
			/>
		</div>
	);
};

export default ClientInvoiceList;
