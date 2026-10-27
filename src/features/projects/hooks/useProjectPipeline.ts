import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "./useProjects";
import { projectPipelineApi } from "../api/projectPipeline";
import type { CreatePipelineTaskPayload, EditableWorkflowStage, UpdatePipelineTaskPayload } from "../types/pipeline";

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
		refetchInterval: 30_000,
	});

export const useCreatePipelineTask = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreatePipelineTaskPayload) => projectPipelineApi.createTask(projectId, payload),
		onSuccess: () => Promise.all([
			queryClient.invalidateQueries({ queryKey: projectPipelineKeys.detail(projectId) }),
			queryClient.invalidateQueries({ queryKey: ["projectMembers"] }),
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) }),
			queryClient.invalidateQueries({ queryKey: projectKeys.lists() }),
			queryClient.invalidateQueries({ queryKey: ["tasks"] }),
		]),
	});
};

export const useMovePipelineTask = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ taskId, workflowStageId }: { taskId: number; workflowStageId: number }) => projectPipelineApi.moveTask(projectId, taskId, workflowStageId),
		onSuccess: () => Promise.all([
			queryClient.invalidateQueries({ queryKey: projectPipelineKeys.detail(projectId) }),
			queryClient.invalidateQueries({ queryKey: ["tasks"] }),
		]),
	});
};

export const useUpdatePipelineTask = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ taskId, payload }: { taskId: number; payload: UpdatePipelineTaskPayload }) =>
			projectPipelineApi.updateTask(projectId, taskId, payload),
		onSuccess: () => Promise.all([
			queryClient.invalidateQueries({ queryKey: projectPipelineKeys.detail(projectId) }),
			queryClient.invalidateQueries({ queryKey: ["projectMembers"] }),
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) }),
			queryClient.invalidateQueries({ queryKey: projectKeys.lists() }),
			queryClient.invalidateQueries({ queryKey: ["tasks"] }),
			queryClient.invalidateQueries({ queryKey: ["task-supervision"] }),
		]),
	});
};

export const useDeletePipelineTask = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (taskId: number) => projectPipelineApi.deleteTask(projectId, taskId),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: projectPipelineKeys.detail(projectId) }),
	});
};

export const useUploadPipelineTaskCover = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ taskId, coverImage }: { taskId: number; coverImage: File }) =>
			projectPipelineApi.uploadTaskCover(projectId, taskId, coverImage),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: projectPipelineKeys.detail(projectId) }),
	});
};

export const useDeletePipelineTaskCover = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (taskId: number) => projectPipelineApi.deleteTaskCover(projectId, taskId),
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
