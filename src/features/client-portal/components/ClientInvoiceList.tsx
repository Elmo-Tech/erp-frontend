"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, AlertCircle, CreditCard, DollarSign, AlertTriangle, Loader2 } from "lucide-react";
import { useClientInvoices, usePayInvoice } from "../hooks/useClientInvoices";
import { ClientInvoice, InvoiceStatus } from "../types/clientInvoice";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Get status badge color based on invoice status
 */
const getStatusBadgeColor = (status: string, isOverdue: boolean): string => {
	if (isOverdue) return "bg-red-100 text-red-800 border-red-200";

	const colors: Record<string, string> = {
		draft: "bg-gray-100 text-gray-800 border-gray-200",
		sent: "bg-blue-100 text-blue-800 border-blue-200",
		paid: "bg-green-100 text-green-800 border-green-200",
		overdue: "bg-red-100 text-red-800 border-red-200",
		cancelled: "bg-gray-100 text-gray-500 border-gray-200",
	};
	return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

/**
 * Format date string to readable format
 */
const formatDate = (dateString: string): string => {
	if (!dateString) return "-";
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

/**
 * Format currency amount
 */
const formatCurrency = (amount: number, currency: string): string => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency || "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
};

/**
 * Loading skeleton for table rows
 */
const TableRowSkeleton: React.FC = () => (
	<TableRow>
		<TableCell>
			<Skeleton className="h-4 w-28" />
		</TableCell>
		<TableCell>
			<Skeleton className="h-4 w-20" />
		</TableCell>
		<TableCell>
			<Skeleton className="h-4 w-16" />
		</TableCell>
		<TableCell>
			<Skeleton className="h-4 w-24" />
		</TableCell>
		<TableCell>
			<Skeleton className="h-4 w-24" />
		</TableCell>
		<TableCell>
			<Skeleton className="h-8 w-20" />
		</TableCell>
	</TableRow>
);

/**
 * ClientInvoiceList component for displaying invoices in table format.
 * Supports filtering by status and displays total outstanding amount.
 *
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6 - Display invoices with filtering and outstanding amount
 */
export const ClientInvoiceList: React.FC = () => {
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [payingInvoiceId, setPayingInvoiceId] = useState<number | null>(null);

	const { data: invoicesData, isLoading, error } = useClientInvoices(statusFilter !== "all" ? { status: statusFilter } : undefined);
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
								<div className="text-2xl font-bold">{formatCurrency(outstandingAmount, "USD")}</div>
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
			<Card>
				<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Receipt className="h-5 w-5" />
							All Invoices
						</CardTitle>
						<CardDescription>View and manage your invoices</CardDescription>
					</div>
					{/* Status Filter */}
					<Select
						value={statusFilter}
						onValueChange={setStatusFilter}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							<SelectItem value={InvoiceStatus.SENT}>Pending</SelectItem>
							<SelectItem value={InvoiceStatus.OVERDUE}>Overdue</SelectItem>
							<SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
							<SelectItem value={InvoiceStatus.CANCELLED}>Cancelled</SelectItem>
						</SelectContent>
					</Select>
				</CardHeader>
				<CardContent>
					{error ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<AlertCircle className="h-12 w-12 text-red-500 mb-4" />
							<p className="text-red-600">Failed to load invoices. Please try again later.</p>
						</div>
					) : isLoading ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Invoice #</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Due Date</TableHead>
									<TableHead>Paid Date</TableHead>
									<TableHead>Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{[1, 2, 3, 4, 5].map((i) => (
									<TableRowSkeleton key={i} />
								))}
							</TableBody>
						</Table>
					) : !invoicesData?.invoices || invoicesData.invoices.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<Receipt className="h-12 w-12 text-muted-foreground mb-4" />
							<CardTitle className="text-lg mb-2">No Invoices Found</CardTitle>
							<CardDescription>{statusFilter !== "all" ? `No invoices with status "${statusFilter}" found.` : "You don't have any invoices yet."}</CardDescription>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Invoice #</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Due Date</TableHead>
									<TableHead>Paid Date</TableHead>
									<TableHead>Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{invoicesData.invoices.map((invoice) => (
									<TableRow
										key={invoice.invoiceId}
										className={cn(invoice.isOverdue && "bg-red-50/50")}
									>
										<TableCell className="font-medium">
											<div className="flex items-center gap-2">
												{invoice.invoiceNumber}
												{invoice.isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
											</div>
										</TableCell>
										<TableCell className="font-semibold">{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
										<TableCell>
											<Badge className={cn("border", getStatusBadgeColor(invoice.status, invoice.isOverdue))}>{invoice.isOverdue ? "Overdue" : invoice.statusLabel}</Badge>
										</TableCell>
										<TableCell className={cn(invoice.isOverdue && "text-red-600 font-medium")}>{formatDate(invoice.dueDate)}</TableCell>
										<TableCell>{invoice.paidAt ? <span className="text-green-600">{formatDate(invoice.paidAt)}</span> : "-"}</TableCell>
										<TableCell>
											{invoice.isPayable && (
												<Button
													size="sm"
													onClick={() => handlePayInvoice(invoice)}
													disabled={payingInvoiceId === invoice.invoiceId}
													className="gap-1"
												>
													{payingInvoiceId === invoice.invoiceId ? (
														<>
															<Loader2 className="h-3 w-3 animate-spin" />
															Processing
														</>
													) : (
														<>
															<CreditCard className="h-3 w-3" />
															Pay Now
														</>
													)}
												</Button>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default ClientInvoiceList;
