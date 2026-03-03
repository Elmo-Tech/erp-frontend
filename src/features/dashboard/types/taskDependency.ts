/**
 * Task Dependency Types
 * Represents dependencies between tasks (blocking/blocked by relationships)
 */

export type DependencyType = "finish_to_start" | "start_to_start" | "finish_to_finish" | "start_to_finish";

export interface TaskDependency {
	id: number;
	taskId: number;
	dependsOnTaskId: number;
	dependencyType: DependencyType;
	lagDays: number;
	isSatisfied: boolean;
	availableStartDate: string | null;
	createdAt: string;
	updatedAt: string;

	// Relationships
	task?: {
		id: number;
		title: string;
		status: string;
	};
	dependsOnTask?: {
		id: number;
		title: string;
		status: string;
		startDate: string | null;
		dueDate: string | null;
	};
}

export interface CreateTaskDependencyData {
	dependsOnTaskId: number;
	dependencyType: DependencyType;
	lagDays?: number;
}

export const DEPENDENCY_TYPE_LABELS: Record<DependencyType, string> = {
	finish_to_start: "Finish to Start (FS)",
	start_to_start: "Start to Start (SS)",
	finish_to_finish: "Finish to Finish (FF)",
	start_to_finish: "Start to Finish (SF)",
};

export const DEPENDENCY_TYPE_DESCRIPTIONS: Record<DependencyType, string> = {
	finish_to_start: "Task B starts when Task A finishes (most common)",
	start_to_start: "Task B starts when Task A starts",
	finish_to_finish: "Task B finishes when Task A finishes",
	start_to_finish: "Task B finishes when Task A starts",
};
