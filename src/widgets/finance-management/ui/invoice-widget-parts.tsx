"use client";

import { Plus, ReceiptText } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatCurrency, formatNumber } from "@/shared/lib/formatters";
import { cn } from "@/shared/lib/utils";
import type { InvoiceTotals } from "@/entities/invoice/model/types";

interface InvoiceSummaryStripProps {
	totals: InvoiceTotals;
	className?: string;
}

interface InvoiceEmptyStateProps {
	title: string;
	description: string;
	canCreate?: boolean;
	onCreate?: () => void;
}

interface InvoiceErrorStateProps {
	message?: string;
}

function formatInvoiceSummaryAmount(amount: number, totals: InvoiceTotals) {
	if (totals.hasMixedCurrencies) {
		return formatNumber(amount, 2);
	}

	return formatCurrency(amount, totals.currency);
}

export function InvoiceSummaryStrip({ totals, className }: InvoiceSummaryStripProps) {
	return (
		<div className={cn("grid gap-3 border-y py-3 md:grid-cols-4", className)}>
			<SummaryMetric
				label="Total"
				value={formatInvoiceSummaryAmount(totals.totalAmount, totals)}
				meta={totals.hasMixedCurrencies ? "Mixed currencies" : `${totals.invoiceCount} invoices`}
			/>
			<SummaryMetric
				label="Paid"
				value={formatInvoiceSummaryAmount(totals.paidAmount, totals)}
				meta={`${totals.paidCount} paid`}
			/>
			<SummaryMetric
				label="Outstanding"
				value={formatInvoiceSummaryAmount(totals.outstandingAmount, totals)}
				meta={`${Math.max(totals.invoiceCount - totals.paidCount, 0)} open`}
			/>
			<SummaryMetric
				label="Overdue"
				value={formatInvoiceSummaryAmount(totals.overdueAmount, totals)}
				meta={`${totals.overdueCount} overdue`}
				tone={totals.overdueCount > 0 ? "danger" : "default"}
			/>
		</div>
	);
}

function SummaryMetric({ label, value, meta, tone = "default" }: { label: string; value: string; meta: string; tone?: "default" | "danger" }) {
	return (
		<div className="min-w-0">
			<div className="text-xs text-muted-foreground">{label}</div>
			<div className={cn("truncate text-lg font-semibold tracking-tight tabular-nums", tone === "danger" && "text-red-600 dark:text-red-400")}>{value}</div>
			<div className="truncate text-xs text-muted-foreground">{meta}</div>
		</div>
	);
}

export function InvoiceListHeader() {
	return (
		<div className="hidden border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[minmax(150px,1.1fr)_minmax(150px,1.2fr)_110px_110px_120px_88px_40px] md:items-center md:gap-3">
			<span>Invoice</span>
			<span>Project</span>
			<span>Status</span>
			<span>Due</span>
			<span>Amount</span>
			<span className="text-right">PDF</span>
			<span className="sr-only">Actions</span>
		</div>
	);
}

export function InvoiceRowsSkeleton() {
	return (
		<div className="flex flex-col">
			{Array.from({ length: 5 }).map((_, index) => (
				<div
					key={index}
					className="grid min-h-14 grid-cols-1 gap-2 border-b px-3 py-2.5 last:border-b-0 md:grid-cols-[minmax(150px,1.1fr)_minmax(150px,1.2fr)_110px_110px_120px_88px_40px] md:items-center md:gap-3"
				>
					<div className="flex flex-col gap-1">
						<Skeleton className="h-4 w-36" />
						<Skeleton className="h-3 w-28" />
					</div>
					<div className="flex flex-col gap-1">
						<Skeleton className="h-4 w-40" />
						<Skeleton className="h-3 w-32" />
					</div>
					<Skeleton className="h-5 w-20" />
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-24" />
					<Skeleton className="size-8 justify-self-end" />
					<Skeleton className="size-8 justify-self-end" />
				</div>
			))}
		</div>
	);
}

export function InvoiceEmptyState({ title, description, canCreate = false, onCreate }: InvoiceEmptyStateProps) {
	return (
		<div className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-center">
			<ReceiptText className="size-6 text-muted-foreground" />
			<div className="flex flex-col gap-1">
				<div className="text-sm font-medium">{title}</div>
				<div className="text-sm text-muted-foreground">{description}</div>
			</div>
			{canCreate && onCreate && (
				<Button
					size="sm"
					variant="outline"
					onClick={onCreate}
				>
					<Plus data-icon="inline-start" />
					New invoice
				</Button>
			)}
		</div>
	);
}

export function InvoiceErrorState({ message }: InvoiceErrorStateProps) {
	return (
		<div className="flex min-h-40 flex-col items-center justify-center gap-1 px-4 text-center">
			<div className="text-sm font-medium">Unable to load invoices</div>
			<div className="text-sm text-muted-foreground">{message || "Please try again."}</div>
		</div>
	);
}
