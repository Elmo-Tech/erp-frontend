/**
 * TaskStatusBadge Component
 * Displays task status with appropriate color coding
 *
 * Requirements: 13.4
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { TaskStatus, TaskStatusLabels, TaskStatusColors } from "../types/task";
import { cn } from "@/lib/utils";

interface TaskStatusBadgeProps {
	status: TaskStatus;
	className?: string;
}

/**
 * TaskStatusBadge component for displaying task status with color coding
 * Requirement 13.4: Display status with appropriate color coding
 */
export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status, className }) => {
	const statusLabel = TaskStatusLabels[status];
	const statusColor = TaskStatusColors[status];

	return (
		<Badge
			variant="secondary"
			className={cn(statusColor, className)}
		>
			{statusLabel}
		</Badge>
	);
};

export default TaskStatusBadge;
