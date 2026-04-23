import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { InvoiceStatus, InvoiceStatusLabels } from "../model/types";

interface InvoiceStatusBadgeProps {
	status: InvoiceStatus | string;
	className?: string;
}

const statusClassNames: Record<InvoiceStatus, string> = {
	[InvoiceStatus.DRAFT]: "border-border text-muted-foreground",
	[InvoiceStatus.SENT]: "border-blue-200 text-blue-700 dark:border-blue-900 dark:text-blue-300",
	[InvoiceStatus.PAID]: "border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-300",
	[InvoiceStatus.OVERDUE]: "border-red-200 text-red-700 dark:border-red-900 dark:text-red-300",
	[InvoiceStatus.CANCELLED]: "border-border text-muted-foreground line-through",
};

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
	const invoiceStatus = status as InvoiceStatus;
	const label = InvoiceStatusLabels[invoiceStatus] ?? status;

	return (
		<Badge
			variant="outline"
			className={cn("rounded-sm bg-background px-1.5 py-0 font-mono text-[11px] font-medium uppercase tracking-normal", statusClassNames[invoiceStatus], className)}
		>
			{label}
		</Badge>
	);
}
