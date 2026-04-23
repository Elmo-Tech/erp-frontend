import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { taskTemplatesApi } from "../api";
import { CreateTaskTemplateData, UpdateTaskTemplateData, TaskTemplateFilters, InstantiateTaskData } from "../types";

/**
 * Hook to fetch all task templates with optional filters
 */
export function useTaskTemplates(filters?: TaskTemplateFilters) {
	return useQuery({
		queryKey: ["task-templates", filters],
		queryFn: () => taskTemplatesApi.getAll(filters).then((res) => res.data.data),
	});
}

/**
 * Hook to fetch a single task template
 */
export function useTaskTemplate(id: number) {
	return useQuery({
		queryKey: ["task-templates", id],
		queryFn: () => taskTemplatesApi.getById(id).then((res) => res.data.data.template),
		enabled: !!id,
	});
}

/**
 * Hook to create a task template
 */
export function useCreateTaskTemplate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateTaskTemplateData) => taskTemplatesApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["task-templates"] });
			toast.success("Template created successfully");
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error, "Failed to create template"));
		},
	});
}

/**
 * Hook to update a task template
 */
export function useUpdateTaskTemplate(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateTaskTemplateData) => taskTemplatesApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["task-templates"] });
			queryClient.invalidateQueries({ queryKey: ["task-templates", id] });
			toast.success("Template updated successfully");
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error, "Failed to update template"));
		},
	});
}

/**
 * Hook to delete a task template
 */
export function useDeleteTaskTemplate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => taskTemplatesApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["task-templates"] });
			toast.success("Template deleted successfully");
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error, "Failed to delete template"));
		},
	});
}

/**
 * Hook to instantiate a task from a template
 */
export function useInstantiateTemplate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ templateId, data }: { templateId: number; data: InstantiateTaskData }) => taskTemplatesApi.instantiate(templateId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			queryClient.invalidateQueries({ queryKey: ["task-templates"] });
			toast.success("Task created from template");
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error, "Failed to create task from template"));
		},
	});
}
