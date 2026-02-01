"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, Column, ConfirmDialog } from "@/components/shared";
import { Search, Filter, Download, CheckCircle, AlertCircle, Clock, DollarSign, FileText, MoreHorizontal, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "sonner";
import { useInvoices, useDeleteInvoice, useMarkInvoiceAsPaid } from "../hooks/useInvoices";
import { Invoice, InvoiceFilters } from "../types";
import { InvoiceStatus } from "@/lib/statusHelpers";
import { usePermissions } from "@/features/admin/hooks/usePermissions";

interface InvoiceManagerProps {
	className?: string;
}

/**
 * InvoiceManager component for managing invoices
 * Features:
 * - Data table with filters (Overdue, Paid, Pending)
 * - Status badges (Red for Overdue, Green for Paid)
 * - Actions: "Mark as Paid", "Download PDF"
 * Requirements: FE-Pack 2 Step 3
 */
export const InvoiceManager: React.FC<InvoiceManagerProps> = ({ className = "" }) => {
	const [filters, setFilters] = useState<InvoiceFilters>({
		page: 1,
		perPage: 10,
	});
	const [invoiceToMarkPaid, setInvoiceToMarkPaid] = useState<Invoice | null>(null);
	const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

	const { data, isLoading, error } = useInvoices(filters);
	const deleteInvoiceMutation = useDeleteInvoice();
	const markAsPaidMutation = useMarkInvoiceAsPaid();

	// Permission checks
	const { canCreateInvoices, canDeleteInvoices, canManageInvoices } = usePermissions();

	// Handle search
	const handleSearch = (search: string) => {
		setFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
	};

	// Handle status filter
	const handleStatusFilter = (status: string) => {
		setFilters((prev) => ({
			...prev,
			status: status === "all" ? undefined : (status as InvoiceStatus),
			page: 1,
		}));
	};

	// Handle pagination
	const handlePageChange = (page: number) => {
		setFilters((prev) => ({ ...prev, page }));
	};

	// Handle mark as paid
	const handleMarkAsPaid = async () => {
		if (!invoiceToMarkPaid) return;

		try {
			await markAsPaidMutation.mutateAsync(invoiceToMarkPaid.invoiceId);
			toast.success("Invoice marked as paid");
			setInvoiceToMarkPaid(null);
		} catch {
			toast.error("Failed to mark invoice as paid");
		}
	};

	// Handle download PDF
	const handleDownloadPDF = (invoice: Invoice) => {
		// This would typically call an API endpoint to generate/download the PDF
		const downloadUrl = `/api/v1/invoices/${invoice.invoiceId}/download`;
		const link = document.createElement("a");
		link.href = downloadUrl;
		link.download = `invoice-${invoice.invoiceNumber}.pdf`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		toast.success("Invoice PDF downloaded");
	};

	// Handle delete
	const handleDelete = async () => {
		if (!invoiceToDelete) return;

		try {
			await deleteInvoiceMutation.mutateAsync(invoiceToDelete.invoiceId);
			toast.success("Invoice deleted successfully");
			setInvoiceToDelete(null);
		} catch {
			toast.error("Failed to delete invoice");
		}
	};

	// Get status badge variant
	const getStatusBadge = (status: InvoiceStatus, dueDate: string, paidAt: string | null) => {
		const isOverdue = !paidAt && new Date(dueDate) < new Date();

		switch (status) {
			case InvoiceStatus.PAID:
				return (
					<Badge
						variant="default"
						className="gap-1 bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80"
					>
						<CheckCircle className="h-3 w-3" />
						Paid
					</Badge>
				);
			case InvoiceStatus.OVERDUE:
			case InvoiceStatus.SENT:
				if (isOverdue) {
					return (
						<Badge
							variant="destructive"
							className="gap-1"
						>
							<AlertCircle className="h-3 w-3" />
							Overdue
						</Badge>
					);
				}
				return (
					<Badge
						variant="secondary"
						className="gap-1 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100/80"
					>
						<Clock className="h-3 w-3" />
						Pending
					</Badge>
				);
			default:
				return (
					<Badge
						variant="secondary"
						className="gap-1"
					>
						<Clock className="h-3 w-3" />
						{status}
					</Badge>
				);
		}
	};

	// Define table columns
	const columns: Column<Invoice>[] = [
		{
			key: "invoiceNumber",
			header: "Invoice #",
			render: (invoice) => <div className="font-medium">{invoice.invoiceNumber}</div>,
		},
		{
			key: "project",
			header: "Project",
			render: (invoice) => <div>{invoice.project ? <span className="font-medium">{invoice.project.title}</span> : <span className="text-muted-foreground">No project</span>}</div>,
		},
		{
			key: "amount",
			header: "Amount",
			render: (invoice) => (
				<div className="font-medium">
					{new Intl.NumberFormat("en-US", {
						style: "currency",
						currency: invoice.currency || "USD",
					}).format(invoice.amount)}
				</div>
			),
		},
		{
			key: "status",
			header: "Status",
			render: (invoice) => getStatusBadge(invoice.status, invoice.dueDate, invoice.paidAt),
		},
		{
			key: "dueDate",
			header: "Due Date",
			render: (invoice) => <div className="text-sm">{format(new Date(invoice.dueDate), "MMM d, yyyy")}</div>,
		},
		{
			key: "paidAt",
			header: "Paid Date",
			render: (invoice) => <div className="text-sm">{invoice.paidAt ? format(new Date(invoice.paidAt), "MMM d, yyyy") : <span className="text-muted-foreground">Not paid</span>}</div>,
		},
		{
			key: "actions",
			header: "",
			render: (invoice) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
							<Download className="h-4 w-4 mr-2" />
							Download PDF
						</DropdownMenuItem>
						{canManageInvoices && invoice.status !== InvoiceStatus.PAID && (
							<DropdownMenuItem onClick={() => setInvoiceToMarkPaid(invoice)}>
								<CheckCircle className="h-4 w-4 mr-2" />
								Mark as Paid
							</DropdownMenuItem>
						)}
						{canDeleteInvoices && (
							<DropdownMenuItem
								onClick={() => setInvoiceToDelete(invoice)}
								className="text-destructive"
							>
								<AlertCircle className="h-4 w-4 mr-2" />
								Delete
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	// Calculate summary stats
	const invoices = data?.invoices || [];
	const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
	const paidAmount = invoices.filter((invoice) => invoice.status === InvoiceStatus.PAID).reduce((sum, invoice) => sum + invoice.amount, 0);
	const overdueCount = invoices.filter((invoice) => invoice.status !== InvoiceStatus.PAID && new Date(invoice.dueDate) < new Date()).length;

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Invoice Manager</h1>
					<p className="text-muted-foreground">Manage and track all project invoices</p>
				</div>
				{canCreateInvoices && (
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Create Invoice
					</Button>
				)}
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<DollarSign className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Total Amount</span>
						</div>
						<p className="text-2xl font-bold">
							{new Intl.NumberFormat("en-US", {
								style: "currency",
								currency: "USD",
							}).format(totalAmount)}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<CheckCircle className="h-4 w-4 text-green-600" />
							<span className="text-sm text-muted-foreground">Paid Amount</span>
						</div>
						<p className="text-2xl font-bold text-green-600">
							{new Intl.NumberFormat("en-US", {
								style: "currency",
								currency: "USD",
							}).format(paidAmount)}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-amber-600" />
							<span className="text-sm text-muted-foreground">Pending Amount</span>
						</div>
						<p className="text-2xl font-bold text-amber-600">
							{new Intl.NumberFormat("en-US", {
								style: "currency",
								currency: "USD",
							}).format(totalAmount - paidAmount)}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<AlertCircle className="h-4 w-4 text-red-600" />
							<span className="text-sm text-muted-foreground">Overdue</span>
						</div>
						<p className="text-2xl font-bold text-red-600">{overdueCount}</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filters
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search invoices..."
									className="pl-10"
									onChange={(e) => handleSearch(e.target.value)}
								/>
							</div>
						</div>
						<Select
							value={filters.status || "all"}
							onValueChange={handleStatusFilter}
						>
							<SelectTrigger className="w-48">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value={InvoiceStatus.SENT}>Sent</SelectItem>
								<SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
								<SelectItem value={InvoiceStatus.OVERDUE}>Overdue</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Invoices Table */}
			<DataTable
				title="Invoices"
				titleBadge={data?.pagination ? `${data.pagination.total} total` : undefined}
				columns={columns}
				data={invoices}
				keyExtractor={(invoice) => invoice.invoiceId}
				isLoading={isLoading}
				error={error}
				pagination={data?.pagination}
				onPageChange={handlePageChange}
				emptyState={{
					icon: FileText,
					title: "No invoices found",
					description: "No invoices match your current filters.",
					action: canCreateInvoices
						? {
								label: "Create Invoice",
								onClick: () => console.log("Create invoice"),
							}
						: undefined,
				}}
			/>

			{/* Mark as Paid Confirmation Dialog */}
			<ConfirmDialog
				open={!!invoiceToMarkPaid}
				onOpenChange={() => setInvoiceToMarkPaid(null)}
				title="Mark Invoice as Paid"
				description={`Are you sure you want to mark invoice ${invoiceToMarkPaid?.invoiceNumber} as paid?`}
				confirmLabel="Mark as Paid"
				onConfirm={handleMarkAsPaid}
				isLoading={markAsPaidMutation.isPending}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				open={!!invoiceToDelete}
				onOpenChange={() => setInvoiceToDelete(null)}
				title="Delete Invoice"
				description={`Are you sure you want to delete invoice ${invoiceToDelete?.invoiceNumber}? This action cannot be undone.`}
				confirmLabel="Delete"
				onConfirm={handleDelete}
				variant="destructive"
				isLoading={deleteInvoiceMutation.isPending}
			/>
		</div>
	);
};
