/**
 * TaskStatusBadge Component
 * Displays task status with appropriate color coding
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { TaskStatus, TaskStatusLabels, TaskStatusColors } from "@/lib/statusHelpers";
import { cn } from "@/lib/utils";
import { useTaskStatuses } from "@/features/admin/hooks/useEnums";

interface TaskStatusBadgeProps {
	status: TaskStatus | string;
	className?: string;
}

/**
 * TaskStatusBadge component for displaying task status with color coding
 */
export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status, className }) => {
	const { data: taskStatuses } = useTaskStatuses();

	let statusLabel = TaskStatusLabels[status as TaskStatus] || status;
	let statusColor = TaskStatusColors[status as TaskStatus] || "bg-gray-100 text-gray-800";
	let customStyle: React.CSSProperties = {};

	if (taskStatuses?.data) {
		const matched = taskStatuses.data.find((s) => s.value === status);
		if (matched) {
			statusLabel = matched.label;
			if (matched.color) {
				customStyle = {
					backgroundColor: matched.color + "15",
					color: matched.color,
					borderColor: matched.color + "30",
				};
				statusColor = "";
			}
		}
	}

	return (
		<Badge
			variant="outline"
			className={cn(statusColor, "border font-medium", className)}
			style={customStyle}
		>
			{statusLabel}
		</Badge>
	);
};

export default TaskStatusBadge;
