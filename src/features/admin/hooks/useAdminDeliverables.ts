/**
 * Admin Deliverables Hooks
 * TanStack Query hooks for admin deliverable management
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminDeliverablesApi, AdminUpdateDeliverableData, AdminChangeStatusData, AdminForceReviewData } from "../api/adminDeliverables";
import { toast } from "sonner";
import { taskDeliverablesKeys } from "@/features/projects/hooks/useTaskDeliverables";

/**
 * Admin update deliverable (any field, any status)
 */
export function useAdminUpdateDeliverable() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ deliverableId, data }: { deliverableId: number; data: AdminUpdateDeliverableData }) => adminDeliverablesApi.update(deliverableId, data),
		onSuccess: (deliverable) => {
			// Invalidate all related queries
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(deliverable.taskId) });
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.detail(deliverable.taskId, deliverable.deliverableId) });
			queryClient.invalidateQueries({ queryKey: ["tasks", deliverable.taskId] });
			toast.success("Deliverable updated successfully by admin");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update deliverable");
		},
	});
}

/**
 * Admin delete deliverable (any status)
 */
export function useAdminDeleteDeliverable() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ deliverableId, taskId }: { deliverableId: number; taskId: number }) => adminDeliverablesApi.delete(deliverableId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(variables.taskId) });
			queryClient.invalidateQueries({ queryKey: ["tasks", variables.taskId] });
			toast.success("Deliverable deleted successfully by admin");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete deliverable");
		},
	});
}

/**
 * Admin change deliverable status directly
 */
export function useAdminChangeDeliverableStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ deliverableId, data }: { deliverableId: number; data: AdminChangeStatusData }) => adminDeliverablesApi.changeStatus(deliverableId, data),
		onSuccess: (deliverable) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(deliverable.taskId) });
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.detail(deliverable.taskId, deliverable.deliverableId) });
			queryClient.invalidateQueries({ queryKey: ["tasks", deliverable.taskId] });
			toast.success("Deliverable status changed successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to change status");
		},
	});
}

/**
 * Admin reset deliverable to pending
 */
export function useAdminResetDeliverable() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (deliverableId: number) => adminDeliverablesApi.reset(deliverableId),
		onSuccess: (deliverable) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(deliverable.taskId) });
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.detail(deliverable.taskId, deliverable.deliverableId) });
			queryClient.invalidateQueries({ queryKey: ["tasks", deliverable.taskId] });
			toast.success("Deliverable reset to pending successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to reset deliverable");
		},
	});
}

/**
 * Admin force approve deliverable
 */
export function useAdminForceApprove() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ deliverableId, data }: { deliverableId: number; data: AdminForceReviewData }) => adminDeliverablesApi.forceApprove(deliverableId, data),
		onSuccess: (deliverable) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(deliverable.taskId) });
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.detail(deliverable.taskId, deliverable.deliverableId) });
			queryClient.invalidateQueries({ queryKey: ["tasks", deliverable.taskId] });
			toast.success("Deliverable force approved successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to force approve");
		},
	});
}

/**
 * Admin force reject deliverable
 */
export function useAdminForceReject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ deliverableId, data }: { deliverableId: number; data: Omit<AdminForceReviewData, "isBonus"> }) => adminDeliverablesApi.forceReject(deliverableId, data),
		onSuccess: (deliverable) => {
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.byTask(deliverable.taskId) });
			queryClient.invalidateQueries({ queryKey: taskDeliverablesKeys.detail(deliverable.taskId, deliverable.deliverableId) });
			queryClient.invalidateQueries({ queryKey: ["tasks", deliverable.taskId] });
			toast.success("Deliverable force rejected successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to force reject");
		},
	});
}
