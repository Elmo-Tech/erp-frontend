import api from "@/lib/axios";
import type { CreatePipelineTaskPayload, EditableWorkflowStage, PipelineTask, ProjectPipeline, ProjectWorkflowStage, UpdatePipelineTaskPayload, WorkflowTemplate } from "../types/pipeline";

export const projectPipelineApi = {
	get: async (projectId: number): Promise<ProjectPipeline> => {
		const response = await api.get<{ data: ProjectPipeline }>(`/projects/${projectId}/pipeline`);
		return response.data.data;
	},

	createTask: async (projectId: number, payload: CreatePipelineTaskPayload): Promise<PipelineTask> => {
		const response = await api.post<{ data: PipelineTask }>(`/projects/${projectId}/pipeline/tasks`, payload);
		return response.data.data;
	},

	updateTask: async (projectId: number, taskId: number, payload: UpdatePipelineTaskPayload): Promise<PipelineTask> => {
		const response = await api.patch<{ data: PipelineTask }>(`/projects/${projectId}/pipeline/tasks/${taskId}`, payload);
		return response.data.data;
	},

	deleteTask: async (projectId: number, taskId: number): Promise<void> => {
		await api.delete(`/projects/${projectId}/pipeline/tasks/${taskId}`);
	},

	uploadTaskCover: async (projectId: number, taskId: number, coverImage: File): Promise<PipelineTask> => {
		const formData = new FormData();
		formData.append("coverImage", coverImage);
		const response = await api.post<{ data: PipelineTask }>(`/projects/${projectId}/pipeline/tasks/${taskId}/cover`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data.data;
	},

	deleteTaskCover: async (projectId: number, taskId: number): Promise<PipelineTask> => {
		const response = await api.delete<{ data: PipelineTask }>(`/projects/${projectId}/pipeline/tasks/${taskId}/cover`);
		return response.data.data;
	},

	moveTask: async (projectId: number, taskId: number, workflowStageId: number, position?: number): Promise<PipelineTask> => {
		const response = await api.patch<{ data: PipelineTask }>(`/projects/${projectId}/pipeline/tasks/${taskId}/stage`, {
			workflowStageId,
			...(position !== undefined ? { position } : {}),
		});
		return response.data.data;
	},

	updateStages: async (projectId: number, stages: EditableWorkflowStage[]): Promise<ProjectWorkflowStage[]> => {
		const response = await api.put<{ data: { stages: ProjectWorkflowStage[] } }>(`/projects/${projectId}/pipeline/stages`, { stages });
		return response.data.data.stages;
	},

	getTemplates: async (): Promise<WorkflowTemplate[]> => {
		const response = await api.get<{ data: { templates: WorkflowTemplate[] } }>("/workflow-templates");
		return response.data.data.templates;
	},

	applyTemplate: async (projectId: number, templateId: number): Promise<ProjectWorkflowStage[]> => {
		const response = await api.post<{ data: { stages: ProjectWorkflowStage[] } }>(`/projects/${projectId}/pipeline/templates/${templateId}`);
		return response.data.data.stages;
	},

	createTemplate: async (payload: { name: string; description?: string; stages: EditableWorkflowStage[] }): Promise<WorkflowTemplate> => {
		const response = await api.post<{ data: WorkflowTemplate }>("/workflow-templates", payload);
		return response.data.data;
	},
};
