/**
 * Task Deliverables API
 * API functions for task deliverables management
 */

import api from "@/shared/api/base";
import { ApiResponse } from "@/_old/features/monitoring/types/api";
import { TaskDeliverable, CreateDeliverableData, UpdateDeliverableData, SubmitDeliverableData, ReviewDeliverableData, DeliverablesResponse } from "../types/taskDeliverable";

export const taskDeliverablesApi = {
	/**
	 * Get all deliverables for a task
	 */
	getAll: (taskId: number) => api.get<ApiResponse<DeliverablesResponse>>(`/tasks/${taskId}/deliverables`).then((res) => res.data.data),

	/**
	 * Get a single deliverable
	 */
	getById: (taskId: number, deliverableId: number) => api.get<ApiResponse<{ deliverable: TaskDeliverable }>>(`/tasks/${taskId}/deliverables/${deliverableId}`).then((res) => res.data.data.deliverable),

	/**
	 * Create a new deliverable
	 */
	create: (taskId: number, data: CreateDeliverableData) => api.post<ApiResponse<{ deliverable: TaskDeliverable }>>(`/tasks/${taskId}/deliverables`, data).then((res) => res.data.data.deliverable),

	/**
	 * Update a deliverable
	 */
	update: (taskId: number, deliverableId: number, data: UpdateDeliverableData) => api.put<ApiResponse<{ deliverable: TaskDeliverable }>>(`/tasks/${taskId}/deliverables/${deliverableId}`, data).then((res) => res.data.data.deliverable),

	/**
	 * Delete a deliverable
	 */
	delete: (taskId: number, deliverableId: number) => api.delete<ApiResponse<null>>(`/tasks/${taskId}/deliverables/${deliverableId}`).then((res) => res.data),

	/**
	 * Submit a deliverable for review
	 */
	submit: (taskId: number, deliverableId: number, data: SubmitDeliverableData) => api.post<ApiResponse<{ deliverable: TaskDeliverable }>>(`/tasks/${taskId}/deliverables/${deliverableId}/submit`, data).then((res) => res.data.data.deliverable),

	/**
	 * Review a deliverable (approve/reject)
	 */
	review: (taskId: number, deliverableId: number, data: ReviewDeliverableData) => api.post<ApiResponse<{ deliverable: TaskDeliverable }>>(`/tasks/${taskId}/deliverables/${deliverableId}/review`, data).then((res) => res.data.data.deliverable),
};
