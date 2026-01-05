/**
 * TaskStatusBadge Component
 * Displays task status with appropriate color coding
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { TaskStatus, TaskStatusLabels, TaskStatusColors } from "@/lib/statusHelpers";
import { cn } from "@/lib/utils";

interface TaskStatusBadgeProps {
	status: TaskStatus | string;
	className?: string;
}

/**
 * TaskStatusBadge component for displaying task status with color coding
 */
export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status, className }) => {
	const statusLabel = TaskStatusLabels[status as TaskStatus] || status;
	const statusColor = TaskStatusColors[status as TaskStatus] || "bg-gray-100 text-gray-800";

	return (
		<Badge
			variant="outline"
			className={cn(statusColor, "border font-medium", className)}
		>
			{statusLabel}
		</Badge>
	);
};

export default TaskStatusBadge;
