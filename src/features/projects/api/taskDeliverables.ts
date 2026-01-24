import api from "@/lib/axios";
import { TaskDeliverable, DeliverablesResponse, CreateDeliverableData, UpdateDeliverableData, SubmitDeliverableData, ReviewDeliverableData, ReorderDeliverablesData } from "../types/taskDeliverable";

/**
 * API functions for task deliverables management
 */
export const taskDeliverablesApi = {
	/**
	 * Get all deliverables for a task
	 */
	getAll: async (taskId: number): Promise<DeliverablesResponse> => {
		const response = await api.get<{ data: DeliverablesResponse }>(`/tasks/${taskId}/deliverables`);
		return response.data.data;
	},

	/**
	 * Create a new deliverable for a task
	 */
	create: async (taskId: number, payload: CreateDeliverableData): Promise<TaskDeliverable> => {
		const response = await api.post<{ data: TaskDeliverable }>(`/tasks/${taskId}/deliverables`, payload);
		return response.data.data;
	},

	/**
	 * Update an existing deliverable
	 */
	update: async (deliverableId: number, payload: UpdateDeliverableData): Promise<TaskDeliverable> => {
		const response = await api.put<{ data: TaskDeliverable }>(`/deliverables/${deliverableId}`, payload);
		return response.data.data;
	},

	/**
	 * Delete a deliverable
	 */
	delete: async (deliverableId: number): Promise<void> => {
		await api.delete(`/deliverables/${deliverableId}`);
	},

	/**
	 * Submit a deliverable for review
	 */
	submit: async (deliverableId: number, payload: SubmitDeliverableData): Promise<TaskDeliverable> => {
		const response = await api.post<{ data: TaskDeliverable }>(`/deliverables/${deliverableId}/submit`, payload);
		return response.data.data;
	},

	/**
	 * Start reviewing a deliverable
	 */
	startReview: async (deliverableId: number): Promise<TaskDeliverable> => {
		const response = await api.post<{ data: TaskDeliverable }>(`/deliverables/${deliverableId}/start-review`);
		return response.data.data;
	},

	/**
	 * Approve a deliverable
	 */
	approve: async (deliverableId: number, payload: ReviewDeliverableData): Promise<TaskDeliverable> => {
		const response = await api.post<{ data: TaskDeliverable }>(`/deliverables/${deliverableId}/approve`, payload);
		return response.data.data;
	},

	/**
	 * Reject a deliverable
	 */
	reject: async (deliverableId: number, payload: ReviewDeliverableData): Promise<TaskDeliverable> => {
		const response = await api.post<{ data: TaskDeliverable }>(`/deliverables/${deliverableId}/reject`, payload);
		return response.data.data;
	},

	/**
	 * Reorder deliverables for a task
	 */
	reorder: async (taskId: number, payload: ReorderDeliverablesData): Promise<void> => {
		await api.post(`/tasks/${taskId}/deliverables/reorder`, payload);
	},
};
