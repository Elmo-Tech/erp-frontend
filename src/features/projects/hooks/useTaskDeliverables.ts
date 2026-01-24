/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Task Deliverables Hooks
 * TanStack Query hooks for task deliverables management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskDeliverablesApi } from "../api/taskDeliverables";
import { CreateDeliverableData, UpdateDeliverableData, SubmitDeliverableData, ReviewDeliverableData } from "../types/taskDeliverable";
import { toast } from "sonner";

// Query Keys
export const taskDeliverablesKeys = {
	all: ["task-deliverables"] as const,
	byTask: (taskId: number) => [...taskDeliverablesKeys.all, taskId] as const,
	detail: (taskId: number, deliverableId: number) => [...taskDeliverablesKeys.byTask(taskId), deliverableId] as const,
};

/**
 * Get all deliverables for a task
 */
export function useTaskDeliverables(taskId: number) {
	return useQuery({
		queryKey: taskDeliverablesKeys.byTask(taskId),
		queryFn: () => taskDeliverablesApi.getAll(taskId).then((data) => data.deliverables),
		enabled: !!taskId,
	});
}

/**
 * Get a single deliverable
 */
export function useTaskDeliverable(taskId: number, deliverableId: number) {
	return useQuery({
		queryKey: taskDeliverablesKeys.detail(taskId, deliverableId),
		queryFn: () => taskDeliverablesApi.getById(taskId, deliverableId),
		enabled: !!taskId && !!deliverableId,
	});
}

/**
 * Create a new deliverable
 */
export function useCreateTaskDeliverable() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ taskId, data }: { taskId: number; data: CreateDeliverableData }) => taskDeliverablesApi.create(taskId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(variables.taskId) });
			queryClient.invalidateQueries({ queryKey: ["tasks", variables.taskId] });
			toast.success("Deliverable created successfully");
		},
		onError: () => {
			toast.error("Failed to create deliverable");
		},
	});
}

/**
 * Update a deliverable
 */
export function useUpdateTaskDeliverable() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ taskId, deliverableId, data }: { taskId: number; deliverableId: number; data: UpdateDeliverableData }) => taskDeliverablesApi.update(taskId, deliverableId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(variables.taskId) });
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.detail(variables.taskId, variables.deliverableId) });
			queryClient.invalidateQueries({ queryKey: ["tasks", variables.taskId] });
			toast.success("Deliverable updated successfully");
		},
		onError: () => {
			toast.error("Failed to update deliverable");
		},
	});
}

/**
 * Delete a deliverable
 */
export function useDeleteTaskDeliverable() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ taskId, deliverableId }: { taskId: number; deliverableId: number }) => taskDeliverablesApi.delete(taskId, deliverableId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(variables.taskId) });
			queryClient.invalidateQueries({ queryKey: ["tasks", variables.taskId] });
			toast.success("Deliverable deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete deliverable");
		},
	});
}

/**
 * Submit a deliverable for review
 */
export function useSubmitTaskDeliverable() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ taskId, deliverableId, data }: { taskId: number; deliverableId: number; data: SubmitDeliverableData }) => taskDeliverablesApi.submit(taskId, deliverableId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(variables.taskId) });
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.detail(variables.taskId, variables.deliverableId) });
			queryClient.invalidateQueries({ queryKey: ["tasks", variables.taskId] });
			toast.success("Deliverable submitted for review");
		},
		onError: () => {
			toast.error("Failed to submit deliverable");
		},
	});
}

/**
 * Start review for a deliverable
 */
export function useStartReviewTaskDeliverable() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ taskId, deliverableId }: { taskId: number; deliverableId: number }) => taskDeliverablesApi.review(taskId, deliverableId, { status: "under_review" as any }),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(variables.taskId) });
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.detail(variables.taskId, variables.deliverableId) });
			queryClient.invalidateQueries({ queryKey: ["tasks", variables.taskId] });
			toast.success("Review started");
		},
		onError: () => {
			toast.error("Failed to start review");
		},
	});
}

/**
 * Approve a deliverable
 */
export function useApproveTaskDeliverable() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ taskId, deliverableId, data }: { taskId: number; deliverableId: number; data: Omit<ReviewDeliverableData, "status"> }) =>
			taskDeliverablesApi.review(taskId, deliverableId, {
				...data,
				status: "approved" as any,
			}),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(variables.taskId) });
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.detail(variables.taskId, variables.deliverableId) });
			queryClient.invalidateQueries({ queryKey: ["tasks", variables.taskId] });
			toast.success("Deliverable approved");
		},
		onError: () => {
			toast.error("Failed to approve deliverable");
		},
	});
}

/**
 * Reject a deliverable
 */
export function useRejectTaskDeliverable() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ taskId, deliverableId, data }: { taskId: number; deliverableId: number; data: Omit<ReviewDeliverableData, "status"> }) =>
			taskDeliverablesApi.review(taskId, deliverableId, {
				...data,
				status: "rejected" as any,
			}),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(variables.taskId) });
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.detail(variables.taskId, variables.deliverableId) });
			queryClient.invalidateQueries({ queryKey: ["tasks", variables.taskId] });
			toast.success("Deliverable rejected");
		},
		onError: () => {
			toast.error("Failed to reject deliverable");
		},
	});
}

/**
 * Review a deliverable (generic - approve or reject)
 */
export function useReviewTaskDeliverable() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ taskId, deliverableId, data }: { taskId: number; deliverableId: number; data: ReviewDeliverableData }) => taskDeliverablesApi.review(taskId, deliverableId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(variables.taskId) });
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.detail(variables.taskId, variables.deliverableId) });
			queryClient.invalidateQueries({ queryKey: ["tasks", variables.taskId] });
			toast.success("Deliverable reviewed successfully");
		},
		onError: () => {
			toast.error("Failed to review deliverable");
		},
	});
}

/**
 * Reorder deliverables (placeholder - not implemented in backend yet)
 */
export function useReorderTaskDeliverables() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ taskId, deliverableIds }: { taskId: number; deliverableIds: number[] }) => {
			// TODO: Implement reorder endpoint in backend
			return Promise.resolve();
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(variables.taskId) });
			toast.success("Deliverables reordered");
		},
		onError: () => {
			toast.error("Failed to reorder deliverables");
		},
	});
}
