"use client";

import { FileText, ReceiptText, WalletCards } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/ui/data-display/EmptyState";
import { formatCurrency } from "@/shared/lib/formatters";

const LEDGER_STATS = [
	{ label: "Total Invoiced", value: 0, icon: ReceiptText },
	{ label: "Total Paid", value: 0, icon: WalletCards },
	{ label: "Outstanding", value: 0, icon: FileText },
];

export default function ClientLedgerPage() {
	return (
		<section className="flex flex-col gap-4">
			<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
				{LEDGER_STATS.map((stat) => {
					const Icon = stat.icon;

					return (
						<div
							key={stat.label}
							className="rounded-md border bg-background p-4"
						>
							<div className="flex items-center justify-between gap-3">
								<div className="space-y-1">
									<div className="text-sm text-muted-foreground">{stat.label}</div>
									<div className="text-2xl font-semibold tracking-tight">{formatCurrency(stat.value)}</div>
								</div>
								<div className="flex size-10 items-center justify-center rounded-md border bg-muted/30 text-muted-foreground">
									<Icon className="size-5" />
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<Empty className="min-h-72 rounded-md border bg-background">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<ReceiptText />
					</EmptyMedia>
					<EmptyTitle>No invoices yet</EmptyTitle>
					<EmptyDescription>Client invoices and payment records will appear here.</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</section>
	);
}
