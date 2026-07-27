export type WorkflowStageCategory = "backlog" | "planned" | "active" | "paused" | "review" | "done" | "cancelled";

export interface PipelineAssignee {
	userId: number;
	name: string;
	avatar?: string;
}

export interface PipelineTask {
	taskId: number;
	projectId: number;
	workflowStageId: number;
	title: string;
	description?: string | null;
	priority: "low" | "medium" | "high" | "urgent";
	assignedTo?: number | null;
	assignee?: PipelineAssignee | null;
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
	assignedTo?: number;
	dueDate?: string;
	estimatedHours?: number;
	priority?: PipelineTask["priority"];
}

export type EditableWorkflowStage = Omit<ProjectWorkflowStage, "stageId" | "tasks" | "position"> & {
	stageId?: number;
};
