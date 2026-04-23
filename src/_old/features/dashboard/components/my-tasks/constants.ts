/**
 * My Tasks Page Constants
 * Centralized constants for task display configuration
 */

import { TaskStatus, TaskPriority } from "../../types/task";

// Priority colors for backgrounds
export const PriorityColors: Record<TaskPriority, string> = {
	[TaskPriority.URGENT]: "bg-red-500",
	[TaskPriority.HIGH]: "bg-orange-500",
	[TaskPriority.MEDIUM]: "bg-yellow-500",
	[TaskPriority.LOW]: "bg-blue-400",
};

// Priority colors for left borders
export const PriorityBorderColors: Record<TaskPriority, string> = {
	[TaskPriority.URGENT]: "border-l-red-500",
	[TaskPriority.HIGH]: "border-l-orange-500",
	[TaskPriority.MEDIUM]: "border-l-yellow-500",
	[TaskPriority.LOW]: "border-l-blue-400",
};

// Status colors for badges
export const StatusColors: Record<TaskStatus, string> = {
	[TaskStatus.TODO]: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
	[TaskStatus.IN_PROGRESS]: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
	[TaskStatus.REVIEW]: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
	[TaskStatus.TESTING]: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
	[TaskStatus.COMPLETED]: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

// Kanban columns configuration
export const KanbanColumns = [
	{
		status: TaskStatus.TODO,
		label: "To Do",
		color: "bg-slate-50 dark:bg-slate-900/50",
		headerColor: "text-slate-600 dark:text-slate-400",
		borderColor: "border-slate-200 dark:border-slate-700",
	},
	{
		status: TaskStatus.IN_PROGRESS,
		label: "In Progress",
		color: "bg-blue-50/50 dark:bg-blue-950/30",
		headerColor: "text-blue-600 dark:text-blue-400",
		borderColor: "border-blue-200 dark:border-blue-800",
	},
	{
		status: TaskStatus.REVIEW,
		label: "Review",
		color: "bg-amber-50/50 dark:bg-amber-950/30",
		headerColor: "text-amber-600 dark:text-amber-400",
		borderColor: "border-amber-200 dark:border-amber-800",
	},
	{
		status: TaskStatus.TESTING,
		label: "Testing",
		color: "bg-purple-50/50 dark:bg-purple-950/30",
		headerColor: "text-purple-600 dark:text-purple-400",
		borderColor: "border-purple-200 dark:border-purple-800",
	},
	{
		status: TaskStatus.COMPLETED,
		label: "Done",
		color: "bg-green-50/50 dark:bg-green-950/30",
		headerColor: "text-green-600 dark:text-green-400",
		borderColor: "border-green-200 dark:border-green-800",
	},
];
