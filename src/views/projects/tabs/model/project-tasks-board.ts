import type { ProjectTask } from "@/features/projects/api/execution.api";

export interface ProjectTasksBoardSections {
	tasksByMilestone: Map<number, ProjectTask[]>;
	backlogTasks: ProjectTask[];
}

export function groupProjectTasksByMilestone(tasks: ProjectTask[]): ProjectTasksBoardSections {
	const tasksByMilestone = new Map<number, ProjectTask[]>();
	const backlogTasks: ProjectTask[] = [];

	for (const task of tasks) {
		if (task.milestoneId === null) {
			backlogTasks.push(task);
			continue;
		}

		const existing = tasksByMilestone.get(task.milestoneId) ?? [];
		existing.push(task);
		tasksByMilestone.set(task.milestoneId, existing);
	}

	return { tasksByMilestone, backlogTasks };
}

interface ResolveProjectTaskForSheetInput {
	tasks: ProjectTask[];
	selectedTask: ProjectTask | null;
	initialTaskId?: number | null;
	dismissedInitialTask: boolean;
}

export function resolveProjectTaskForSheet({
	tasks,
	selectedTask,
	initialTaskId,
	dismissedInitialTask,
}: ResolveProjectTaskForSheetInput): ProjectTask | null {
	const initialTask = !dismissedInitialTask && initialTaskId ? (tasks.find((task) => task.taskId === initialTaskId) ?? null) : null;
	const taskForSheet = selectedTask ?? initialTask;

	return taskForSheet ? (tasks.find((task) => task.taskId === taskForSheet.taskId) ?? taskForSheet) : null;
}

export function toggleCollapsedSection(current: Record<string, boolean>, key: string): Record<string, boolean> {
	return { ...current, [key]: !current[key] };
}
