import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

interface RoleBadgeProps {
	role: string;
	className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
	return (
		<Badge
			variant="outline"
			className={cn("h-5 rounded-sm px-1.5 text-[11px] font-medium capitalize", className)}
		>
			{role.replace(/[-_]/g, " ")}
		</Badge>
	);
}
