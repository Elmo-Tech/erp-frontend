import type { ChecklistItem } from "@/features/dashboard/types/task";

export type WorkflowStageCategory = "backlog" | "planned" | "active" | "paused" | "review" | "done" | "cancelled";

export interface PipelineAssignee {
	userId: number;
	name: string;
	avatar?: string;
	isPrimary?: boolean;
}

export interface PipelineTask {
	taskId: number;
	projectId: number;
	workflowStageId: number;
	title: string;
	description?: string | null;
	checklist?: ChecklistItem[];
	supervisors?: PipelineAssignee[];
	projectTypes?: { id: number; label: string; color?: string | null }[];
	coverImageUrl?: string | null;
	priority: "low" | "medium" | "high" | "urgent";
	assignedTo?: number | null;
	assignee?: PipelineAssignee | null;
	assignees: PipelineAssignee[];
	supervisorId?: number | null;
	supervisor?: PipelineAssignee | null;
	totalTimeSpent?: number;
	activeWorkTimers?: { userId: number; name: string; startTime: string }[];
	dueDate?: string | null;
	estimatedHours?: number | null;
	position: number;
	holdReason?: string | null;
}

export interface ProjectWorkflowStage {
	stageId: number;
	name: string;
	slug: string;
	color: string;
	category: WorkflowStageCategory;
	position: number;
	isTerminal: boolean;
	tasks: PipelineTask[];
}

export interface ProjectPipeline {
	project: {
		projectId: number;
		title: string;
	};
	stages: ProjectWorkflowStage[];
}

export interface WorkflowTemplateStage extends Omit<ProjectWorkflowStage, "stageId" | "tasks"> {
	templateStageId: number;
}

export interface WorkflowTemplate {
	templateId: number;
	name: string;
	description?: string | null;
	isDefault: boolean;
	stages: WorkflowTemplateStage[];
}

export interface CreatePipelineTaskPayload {
	workflowStageId: number;
	title: string;
	description?: string;
	checklist?: ChecklistItem[];
	supervisorIds?: number[];
	projectTypeIds?: number[];
	assignedUserIds?: number[];
	supervisorId?: number | null;
	dueDate?: string;
	estimatedHours?: number;
	priority?: PipelineTask["priority"];
}

export interface UpdatePipelineTaskPayload {
	workflowStageId?: number;
	title?: string;
	description?: string | null;
	checklist?: ChecklistItem[];
	supervisorIds?: number[];
	projectTypeIds?: number[];
	assignedUserIds?: number[] | null;
	supervisorId?: number | null;
	dueDate?: string | null;
	estimatedHours?: number | null;
	priority?: PipelineTask["priority"];
}

export type EditableWorkflowStage = Omit<ProjectWorkflowStage, "stageId" | "tasks" | "position"> & {
	stageId?: number;
};
