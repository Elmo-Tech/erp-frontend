"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { InvoiceStatusBadge } from "@/shared/ui/StatusBadge";
import { InvoiceStatus } from "@/_old/features/invoices/types";
import { Plus, MoreHorizontal, FileText, Send, CheckCircle, Clock, XCircle } from "lucide-react";

interface Invoice {
	invoiceId: number;
	invoiceNumber: string;
	amount: number;
	currency: string;
	status: InvoiceStatus;
	dueDate: string;
	project?: {
		title: string;
	};
}

interface ClientInvoicesTabProps {
	invoices: Invoice[];
	hasProjects: boolean;
	onAddInvoice: () => void;
	onUpdateStatus: (invoiceId: number, status: InvoiceStatus) => void;
	isUpdating: boolean;
}

export function ClientInvoicesTab({ invoices, hasProjects, onAddInvoice, onUpdateStatus, isUpdating }: ClientInvoicesTabProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Invoices</CardTitle>
					<CardDescription>All invoices for this client</CardDescription>
				</div>
				<Button
					onClick={onAddInvoice}
					disabled={!hasProjects}
				>
					<Plus className="h-4 w-4 mr-2" />
					Add Invoice
				</Button>
			</CardHeader>
			<CardContent>
				{invoices.length > 0 ? (
					<div className="space-y-3">
						{invoices.map((invoice) => (
							<InvoiceRow
								key={invoice.invoiceId}
								invoice={invoice}
								onUpdateStatus={onUpdateStatus}
								isUpdating={isUpdating}
							/>
						))}
					</div>
				) : (
					<p className="text-center py-8 text-muted-foreground">{!hasProjects ? "Create a project first to add invoices" : "No invoices yet"}</p>
				)}
			</CardContent>
		</Card>
	);
}

interface InvoiceRowProps {
	invoice: Invoice;
	onUpdateStatus: (invoiceId: number, status: InvoiceStatus) => void;
	isUpdating: boolean;
}

function InvoiceRow({ invoice, onUpdateStatus, isUpdating }: InvoiceRowProps) {
	return (
		<div className="flex items-center justify-between p-4 border rounded-lg">
			<div>
				<p className="font-medium">{invoice.invoiceNumber}</p>
				<p className="text-sm text-muted-foreground">
					{invoice.project?.title} • Due: {invoice.dueDate}
				</p>
			</div>
			<div className="flex items-center gap-3">
				<span className="font-medium">
					{invoice.currency} {Number(invoice.amount).toLocaleString()}
				</span>
				<InvoiceStatusBadge status={invoice.status} />
				<InvoiceActionsMenu
					invoice={invoice}
					onUpdateStatus={onUpdateStatus}
					isUpdating={isUpdating}
				/>
			</div>
		</div>
	);
}

interface InvoiceActionsMenuProps {
	invoice: Invoice;
	onUpdateStatus: (invoiceId: number, status: InvoiceStatus) => void;
	isUpdating: boolean;
}

function InvoiceActionsMenu({ invoice, onUpdateStatus, isUpdating }: InvoiceActionsMenuProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					disabled={isUpdating}
				>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => onUpdateStatus(invoice.invoiceId, InvoiceStatus.DRAFT)}
					disabled={invoice.status === InvoiceStatus.DRAFT}
				>
					<FileText className="h-4 w-4 mr-2" />
					Mark as Draft
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => onUpdateStatus(invoice.invoiceId, InvoiceStatus.SENT)}
					disabled={invoice.status === InvoiceStatus.SENT}
				>
					<Send className="h-4 w-4 mr-2" />
					Mark as Sent
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => onUpdateStatus(invoice.invoiceId, InvoiceStatus.PAID)}
					disabled={invoice.status === InvoiceStatus.PAID}
				>
					<CheckCircle className="h-4 w-4 mr-2" />
					Mark as Paid
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => onUpdateStatus(invoice.invoiceId, InvoiceStatus.OVERDUE)}
					disabled={invoice.status === InvoiceStatus.OVERDUE}
				>
					<Clock className="h-4 w-4 mr-2" />
					Mark as Overdue
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => onUpdateStatus(invoice.invoiceId, InvoiceStatus.CANCELLED)}
					disabled={invoice.status === InvoiceStatus.CANCELLED}
					className="text-destructive"
				>
					<XCircle className="h-4 w-4 mr-2" />
					Cancel Invoice
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
