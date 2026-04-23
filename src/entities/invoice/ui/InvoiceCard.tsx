"use client";

import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { formatDateDisplay } from "@/shared/lib/dateUtils";
import { formatCurrency } from "@/shared/lib/formatters";
import { cn } from "@/shared/lib/utils";
import { isInvoiceOverdue } from "../model/finance";
import { InvoiceStatus, type Invoice } from "../model/types";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

interface InvoiceCardProps {
	invoice: Invoice;
	projectLabel?: string;
	downloadAction?: ReactNode;
	onMarkPaid?: (invoice: Invoice) => void;
	onDelete?: (invoice: Invoice) => void;
	className?: string;
}

export function InvoiceCard({ invoice, projectLabel, downloadAction, onMarkPaid, onDelete, className }: InvoiceCardProps) {
	const status = isInvoiceOverdue(invoice) ? InvoiceStatus.OVERDUE : invoice.status;
	const title = invoice.invoiceNumber || `Invoice #${invoice.invoiceId}`;
	const canMarkPaid = invoice.status !== InvoiceStatus.PAID && invoice.status !== InvoiceStatus.CANCELLED && Boolean(onMarkPaid);
	const hasMenu = canMarkPaid || Boolean(onDelete);

	return (
		<article
			className={cn(
				"grid min-h-14 grid-cols-1 gap-2 border-b px-3 py-2.5 text-sm last:border-b-0 md:grid-cols-[minmax(150px,1.1fr)_minmax(150px,1.2fr)_110px_110px_120px_88px_40px] md:items-center md:gap-3",
				className
			)}
		>
			<div className="min-w-0">
				<div className="truncate font-medium leading-5">{title}</div>
				<div className="truncate text-xs text-muted-foreground">Created {formatDateDisplay(invoice.createdAt)}</div>
			</div>

			<div className="min-w-0">
				<div className="truncate leading-5">{projectLabel || invoice.project?.title || `Project #${invoice.projectId}`}</div>
				<div className="truncate text-xs text-muted-foreground">{invoice.client?.name || invoice.notes || "No note"}</div>
			</div>

			<div>
				<InvoiceStatusBadge status={status} />
			</div>

			<div className="text-xs tabular-nums text-muted-foreground">Due {formatDateDisplay(invoice.dueDate)}</div>

			<div className="text-xs font-medium tabular-nums">{formatCurrency(invoice.amount, invoice.currency || "USD")}</div>

			<div className="flex justify-start md:justify-end">{downloadAction}</div>

			<div className="flex justify-end">
				{hasMenu && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label={`Open actions for ${title}`}
							>
								<MoreHorizontal />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{canMarkPaid && <DropdownMenuItem onClick={() => onMarkPaid?.(invoice)}>Mark as paid</DropdownMenuItem>}
							{onDelete && (
								<DropdownMenuItem
									className="text-destructive focus:text-destructive"
									onClick={() => onDelete(invoice)}
								>
									Delete
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</article>
	);
}
