import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskDeliverablesApi } from "../api/taskDeliverables";
import { TaskDeliverable, DeliverablesResponse, CreateDeliverableData, UpdateDeliverableData, SubmitDeliverableData, ReviewDeliverableData, ReorderDeliverablesData } from "../types/taskDeliverable";

/**
 * Query keys for task deliverables
 */
export const taskDeliverablesKeys = {
	all: ["task-deliverables"] as const,
	byTask: (taskId: number) => [...taskDeliverablesKeys.all, "task", taskId] as const,
};

/**
 * Hook to fetch deliverables for a task
 */
export const useTaskDeliverables = (taskId: number, enabled = true) => {
	return useQuery<DeliverablesResponse, Error>({
		queryKey: taskDeliverablesKeys.byTask(taskId),
		queryFn: () => taskDeliverablesApi.getAll(taskId),
		enabled: enabled && !!taskId,
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
};

/**
 * Hook to create a new deliverable
 */
export const useCreateTaskDeliverable = () => {
	const queryClient = useQueryClient();

	return useMutation<TaskDeliverable, Error, { taskId: number; data: CreateDeliverableData }>({
		mutationFn: ({ taskId, data }) => taskDeliverablesApi.create(taskId, data),
		onSuccess: (_, { taskId }) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(taskId) });
		},
	});
};

/**
 * Hook to update a deliverable
 */
export const useUpdateTaskDeliverable = () => {
	const queryClient = useQueryClient();

	return useMutation<TaskDeliverable, Error, { deliverableId: number; data: UpdateDeliverableData }>({
		mutationFn: ({ deliverableId, data }) => taskDeliverablesApi.update(deliverableId, data),
		onSuccess: (deliverable) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(deliverable.taskId) });
		},
	});
};

/**
 * Hook to delete a deliverable
 */
export const useDeleteTaskDeliverable = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: (deliverableId: number) => taskDeliverablesApi.delete(deliverableId),
		onSuccess: () => {
			// Invalidate all task deliverables since we don't have taskId in response
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.all });
		},
	});
};

/**
 * Hook to submit a deliverable for review
 */
export const useSubmitTaskDeliverable = () => {
	const queryClient = useQueryClient();

	return useMutation<TaskDeliverable, Error, { deliverableId: number; data: SubmitDeliverableData }>({
		mutationFn: ({ deliverableId, data }) => taskDeliverablesApi.submit(deliverableId, data),
		onSuccess: (deliverable) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(deliverable.taskId) });
		},
	});
};

/**
 * Hook to start reviewing a deliverable
 */
export const useStartReviewTaskDeliverable = () => {
	const queryClient = useQueryClient();

	return useMutation<TaskDeliverable, Error, number>({
		mutationFn: (deliverableId: number) => taskDeliverablesApi.startReview(deliverableId),
		onSuccess: (deliverable) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(deliverable.taskId) });
		},
	});
};

/**
 * Hook to approve a deliverable
 */
export const useApproveTaskDeliverable = () => {
	const queryClient = useQueryClient();

	return useMutation<TaskDeliverable, Error, { deliverableId: number; data: ReviewDeliverableData }>({
		mutationFn: ({ deliverableId, data }) => taskDeliverablesApi.approve(deliverableId, data),
		onSuccess: (deliverable) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(deliverable.taskId) });
		},
	});
};

/**
 * Hook to reject a deliverable
 */
export const useRejectTaskDeliverable = () => {
	const queryClient = useQueryClient();

	return useMutation<TaskDeliverable, Error, { deliverableId: number; data: ReviewDeliverableData }>({
		mutationFn: ({ deliverableId, data }) => taskDeliverablesApi.reject(deliverableId, data),
		onSuccess: (deliverable) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(deliverable.taskId) });
		},
	});
};

/**
 * Hook to reorder deliverables
 */
export const useReorderTaskDeliverables = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, { taskId: number; data: ReorderDeliverablesData }>({
		mutationFn: ({ taskId, data }) => taskDeliverablesApi.reorder(taskId, data),
		onSuccess: (_, { taskId }) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(taskId) });
		},
	});
};
