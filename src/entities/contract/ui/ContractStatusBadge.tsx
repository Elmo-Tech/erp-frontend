import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { ContractStatus, ContractStatusLabels } from "../model/types";

interface ContractStatusBadgeProps {
	status: ContractStatus | string;
	className?: string;
}

export function ContractStatusBadge({ status, className }: ContractStatusBadgeProps) {
	const label = ContractStatusLabels[status as ContractStatus] ?? status;

	return (
		<Badge
			variant="outline"
			className={cn("rounded-sm border-border bg-background px-1.5 py-0 font-mono text-[11px] font-medium uppercase tracking-normal text-muted-foreground", className)}
		>
			{label}
		</Badge>
	);
}
