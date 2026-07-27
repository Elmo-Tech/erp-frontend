import {
	ExecutionTaskStatus,
	ExecutionTaskStatusColors,
	ExecutionTaskStatusLabels,
	type ProjectTask,
	type ProjectTimeEntry,
	type ExecutionTaskStatusValue,
} from "../api/execution.api";

const DEFAULT_STATUS_COLOR = "bg-muted text-muted-foreground border-border";

export interface TaskCardView {
	runningEntry: ProjectTimeEntry | null;
	isRunning: boolean;
	totalDeliverables: number;
	completedDeliverables: number;
	allDeliverablesDone: boolean;
	statusColorClass: string;
	statusLabel: string;
	isCompleted: boolean;
	cardStatusClass: string;
}

export function getTaskAssigneeInitials(name: string): string {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0])
		.join("")
		.toUpperCase();
}

export function formatTaskLoggedTime(totalMinutes: number): string {
	if (totalMinutes === 0) return "0m";

	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	if (hours === 0) return `${minutes}m`;
	if (minutes === 0) return `${hours}h`;
	return `${hours}h ${minutes}m`;
}

export function buildTaskCardView(task: ProjectTask, currentUserId?: number): TaskCardView {
	const runningEntry =
		task.timeEntries?.find(
			(entry) => entry.isRunning && (currentUserId === undefined || entry.userId === currentUserId),
		) ?? null;
	const deliverables = task.deliverables ?? [];
	const totalDeliverables = deliverables.length;
	const completedDeliverables = deliverables.filter((deliverable) => deliverable.isCompleted).length;

	return {
		runningEntry,
		isRunning: runningEntry !== null,
		totalDeliverables,
		completedDeliverables,
		allDeliverablesDone: totalDeliverables > 0 && completedDeliverables === totalDeliverables,
		statusColorClass: ExecutionTaskStatusColors[task.status as ExecutionTaskStatusValue] ?? DEFAULT_STATUS_COLOR,
		statusLabel: ExecutionTaskStatusLabels[task.status as ExecutionTaskStatusValue] ?? task.statusLabel ?? task.status,
		isCompleted: task.status === ExecutionTaskStatus.DONE || task.status === "completed",
		cardStatusClass: taskCardStatusClass(task.status),
	};
}

function taskCardStatusClass(status: string): string {
	switch (status) {
		case ExecutionTaskStatus.DONE:
			return "opacity-60 bg-muted/50 grayscale-[0.3]";
		case ExecutionTaskStatus.QA:
			return "border-amber-400 shadow-sm";
		case ExecutionTaskStatus.IN_REVIEW:
			return "border-purple-400 shadow-sm";
		case ExecutionTaskStatus.IN_PROGRESS:
			return "border-blue-500 shadow-sm";
		default:
			return "";
	}
}
