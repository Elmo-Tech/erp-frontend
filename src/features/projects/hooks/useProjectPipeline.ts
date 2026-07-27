import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectPipelineApi } from "../api/projectPipeline";
import type { CreatePipelineTaskPayload, EditableWorkflowStage } from "../types/pipeline";

export const projectPipelineKeys = {
	all: ["project-pipeline"] as const,
	detail: (projectId: number) => [...projectPipelineKeys.all, projectId] as const,
	templates: ["workflow-templates"] as const,
};

export const useProjectPipeline = (projectId: number) =>
	useQuery({
		queryKey: projectPipelineKeys.detail(projectId),
		queryFn: () => projectPipelineApi.get(projectId),
		enabled: projectId > 0,
	});

export const useCreatePipelineTask = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreatePipelineTaskPayload) => projectPipelineApi.createTask(projectId, payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: projectPipelineKeys.detail(projectId) }),
	});
};

export const useMovePipelineTask = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ taskId, workflowStageId }: { taskId: number; workflowStageId: number }) => projectPipelineApi.moveTask(projectId, taskId, workflowStageId),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: projectPipelineKeys.detail(projectId) }),
	});
};

export const useWorkflowTemplates = (enabled = true) =>
	useQuery({
		queryKey: projectPipelineKeys.templates,
		queryFn: projectPipelineApi.getTemplates,
		enabled,
	});

export const useUpdateProjectWorkflow = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (stages: EditableWorkflowStage[]) => projectPipelineApi.updateStages(projectId, stages),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: projectPipelineKeys.detail(projectId) }),
	});
};

export const useApplyWorkflowTemplate = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (templateId: number) => projectPipelineApi.applyTemplate(projectId, templateId),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: projectPipelineKeys.detail(projectId) }),
	});
};

export const useCreateWorkflowTemplate = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: projectPipelineApi.createTemplate,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: projectPipelineKeys.templates }),
	});
};
