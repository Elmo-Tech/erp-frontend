/**
 * Admin Deliverables API
 * API functions for admin deliverable management with full control
 */

import api from "@/shared/api/base";
import { ApiResponse } from "@/_old/features/monitoring/types/api";
import { TaskDeliverable } from "@/_old/features/projects/types/taskDeliverable";

export interface AdminUpdateDeliverableData {
	title?: string;
	description?: string;
	acceptanceCriteria?: string;
	submissionNotes?: string;
	reviewNotes?: string;
	pointsAwarded?: number;
	isBonus?: boolean;
	order?: number;
}

export interface AdminChangeStatusData {
	status: "pending" | "submitted" | "under_review" | "approved" | "rejected";
	reason: string;
}

export interface AdminForceReviewData {
	reviewNotes: string;
	pointsAwarded: number;
	isBonus?: boolean;
}

export const adminDeliverablesApi = {
	/**
	 * Update any field in any status (admin only)
	 */
	update: (deliverableId: number, data: AdminUpdateDeliverableData) => api.put<ApiResponse<{ deliverable: TaskDeliverable }>>(`/admin/deliverables/${deliverableId}`, data).then((res) => res.data.data.deliverable),

	/**
	 * Delete deliverable in any status (admin only)
	 */
	delete: (deliverableId: number) => api.delete<ApiResponse<null>>(`/admin/deliverables/${deliverableId}`).then((res) => res.data),

	/**
	 * Change status directly (admin only)
	 */
	changeStatus: (deliverableId: number, data: AdminChangeStatusData) => api.patch<ApiResponse<{ deliverable: TaskDeliverable }>>(`/admin/deliverables/${deliverableId}/status`, data).then((res) => res.data.data.deliverable),

	/**
	 * Reset to pending status (admin only)
	 */
	reset: (deliverableId: number) => api.patch<ApiResponse<{ deliverable: TaskDeliverable }>>(`/admin/deliverables/${deliverableId}/reset`).then((res) => res.data.data.deliverable),

	/**
	 * Force approve (admin only)
	 */
	forceApprove: (deliverableId: number, data: AdminForceReviewData) => api.post<ApiResponse<{ deliverable: TaskDeliverable }>>(`/admin/deliverables/${deliverableId}/force-approve`, data).then((res) => res.data.data.deliverable),

	/**
	 * Force reject (admin only)
	 */
	forceReject: (deliverableId: number, data: Omit<AdminForceReviewData, "isBonus">) => api.post<ApiResponse<{ deliverable: TaskDeliverable }>>(`/admin/deliverables/${deliverableId}/force-reject`, data).then((res) => res.data.data.deliverable),
};
