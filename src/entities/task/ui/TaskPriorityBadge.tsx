import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { TaskPriority, TaskPriorityLabels } from "../model/types";

interface TaskPriorityBadgeProps {
	priority: TaskPriority;
	className?: string;
}

const PRIORITY_TONE: Record<TaskPriority, string> = {
	[TaskPriority.LOW]: "border-border text-muted-foreground",
	[TaskPriority.MEDIUM]: "border-blue-200 text-blue-700 dark:border-blue-900 dark:text-blue-300",
	[TaskPriority.HIGH]: "border-orange-200 text-orange-700 dark:border-orange-900 dark:text-orange-300",
	[TaskPriority.URGENT]: "border-red-200 text-red-700 dark:border-red-900 dark:text-red-300",
};

export function TaskPriorityBadge({ priority, className }: TaskPriorityBadgeProps) {
	return (
		<Badge
			variant="outline"
			className={cn("rounded-sm bg-background px-1.5 py-0 font-mono text-[11px] font-medium uppercase tracking-normal", PRIORITY_TONE[priority], className)}
		>
			{TaskPriorityLabels[priority]}
		</Badge>
	);
}
