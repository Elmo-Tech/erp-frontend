import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { ProjectStatus, ProjectStatusLabels } from "../model/types";

interface ProjectStatusBadgeProps {
	status: ProjectStatus | string;
	className?: string;
}

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
	const label = ProjectStatusLabels[status as ProjectStatus] ?? status;

	return (
		<Badge
			variant="outline"
			className={cn("rounded-sm border-border bg-background px-1.5 py-0 font-mono text-[11px] font-medium uppercase tracking-normal text-muted-foreground", className)}
		>
			{label}
		</Badge>
	);
}
