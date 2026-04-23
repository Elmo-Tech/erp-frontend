/**
 * Tasks Tab Constants
 * Shared constants for task display
 */

import { TaskStatus, TaskStatusLabels, TaskPriority, TaskPriorityLabels } from "@/_old/features/dashboard/types/task";

export const STATUS_OPTIONS = Object.values(TaskStatus).map((status) => ({
	value: status,
	label: TaskStatusLabels[status],
}));

export const PRIORITY_OPTIONS = Object.values(TaskPriority).map((priority) => ({
	value: priority,
	label: TaskPriorityLabels[priority],
}));

export const PriorityIndicator: Record<TaskPriority, string> = {
	[TaskPriority.URGENT]: "bg-red-500",
	[TaskPriority.HIGH]: "bg-orange-500",
	[TaskPriority.MEDIUM]: "bg-yellow-500",
	[TaskPriority.LOW]: "bg-blue-500",
};
