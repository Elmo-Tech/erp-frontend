import { api } from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/features/monitoring/types/api";
import type { CodeReview, CreateCodeReviewData, UpdateCodeReviewData, CodeReviewFilters, CodeReviewStats } from "../types/codeReview";

export const codeReviewApi = {
	// Get paginated list of code reviews
	getAll: (filters?: CodeReviewFilters & { perPage?: number; page?: number }) =>
		api.get<ApiResponse<PaginatedResponse<CodeReview>>>("/code-reviews", {
			params: {
				...filters,
				"filter[asReviewer]": filters?.asReviewer?.toString(),
				"filter[asDeveloper]": filters?.asDeveloper?.toString(),
				"filter[status]": filters?.status,
				"filter[taskId]": filters?.taskId,
			},
		}),

	// Get single code review
	getById: (id: number) => api.get<ApiResponse<CodeReview>>(`/code-reviews/${id}`),

	// Create new code review
	create: (data: CreateCodeReviewData) => api.post<ApiResponse<CodeReview>>("/code-reviews", data),

	// Update code review
	update: (id: number, data: UpdateCodeReviewData) => api.put<ApiResponse<CodeReview>>(`/code-reviews/${id}`, data),

	// Approve code review
	approve: (id: number) => api.post<ApiResponse<CodeReview>>(`/code-reviews/${id}/approve`),

	// Request revision
	requestRevision: (id: number, suggestions: string) => api.post<ApiResponse<CodeReview>>(`/code-reviews/${id}/request-revision`, { suggestions }),

	// Reject code review
	reject: (id: number, reason: string) => api.post<ApiResponse<CodeReview>>(`/code-reviews/${id}/reject`, { reason }),

	// Get pending reviews for current user as reviewer
	getMyPending: () => api.get<ApiResponse<CodeReview[]>>("/code-reviews/my-pending"),

	// Get stats for current user as developer
	getMyStats: (startDate?: string, endDate?: string) =>
		api.get<ApiResponse<CodeReviewStats>>("/code-reviews/my-stats", {
			params: { startDate, endDate },
		}),
};
