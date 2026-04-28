import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { LeadStatus, LeadStatusLabels } from "../model/types";

interface LeadStatusBadgeProps {
	status: LeadStatus | string;
	className?: string;
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
	const label = LeadStatusLabels[status as LeadStatus] ?? status;

	return (
		<Badge
			variant="outline"
			className={cn("rounded-sm border-border bg-background px-1.5 py-0 font-mono text-[11px] font-medium uppercase tracking-normal text-muted-foreground", className)}
		>
			{label}
		</Badge>
	);
}
