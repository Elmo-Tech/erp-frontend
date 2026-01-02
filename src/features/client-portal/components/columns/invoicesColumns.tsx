"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Column } from "@/components/shared/data-display/DataTable";
import { ClientInvoice } from "../../types/clientInvoice";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { AlertTriangle, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface InvoicesColumnsOptions {
	onPayInvoice: (invoice: ClientInvoice) => void;
	payingInvoiceId: number | null;
}

export function getInvoicesColumns({ onPayInvoice, payingInvoiceId }: InvoicesColumnsOptions): Column<ClientInvoice>[] {
	return [
		{
			key: "invoiceNumber",
			header: "Invoice #",
			render: (invoice) => (
				<div className="flex items-center gap-2 font-medium">
					{invoice.invoiceNumber}
					{invoice.isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
				</div>
			),
		},
		{
			key: "amount",
			header: "Amount",
			render: (invoice) => <span className="font-semibold">{formatCurrency(invoice.amount, invoice.currency)}</span>,
		},
		{
			key: "status",
			header: "Status",
			render: (invoice) => <Badge className={cn("border", getStatusBadgeColor(invoice.status, invoice.isOverdue))}>{invoice.isOverdue ? "Overdue" : invoice.statusLabel}</Badge>,
		},
		{
			key: "dueDate",
			header: "Due Date",
			render: (invoice) => <span className={cn(invoice.isOverdue && "text-red-600 font-medium")}>{formatDate(invoice.dueDate)}</span>,
		},
		{
			key: "paidAt",
			header: "Paid Date",
			render: (invoice) => (invoice.paidAt ? <span className="text-green-600">{formatDate(invoice.paidAt)}</span> : <span className="text-muted-foreground">-</span>),
		},
		{
			key: "actions",
			header: "Action",
			className: "w-[120px]",
			render: (invoice) =>
				invoice.isPayable ? (
					<Button
						size="sm"
						onClick={() => onPayInvoice(invoice)}
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
				) : null,
		},
	];
}
