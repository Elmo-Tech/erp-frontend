import { formatDistanceToNow } from "date-fns";
import type { AuditLog } from "../model/types";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

interface AuditLogItemProps {
	log: AuditLog;
	className?: string;
}

export function AuditLogItem({ log, className }: AuditLogItemProps) {
	return (
		<div className={cn("grid gap-3 border-b px-3 py-2 text-sm last:border-b-0 md:grid-cols-[180px_1fr_160px_120px]", className)}>
			<div className="min-w-0">
				<div className="truncate font-medium">{log.userName || "System"}</div>
				<div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</div>
			</div>
			<div className="min-w-0">
				<div className="truncate">{log.description}</div>
				<div className="truncate text-xs text-muted-foreground">
					{log.auditableType || "resource"}
					{log.auditableId ? ` #${log.auditableId}` : ""}
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Badge
					variant={log.isSensitive ? "destructive" : "outline"}
					className="h-5 rounded-sm px-1.5 text-[11px]"
				>
					{log.action}
				</Badge>
			</div>
			<div className="truncate text-xs text-muted-foreground md:text-right">{log.ipAddress || "no ip"}</div>
		</div>
	);
}
