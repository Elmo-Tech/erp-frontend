import api from "@/lib/axios";
import { ApiResponse } from "@/features/monitoring/types/api";
import { EmployeeReviewData, EmployeeReviewFilters } from "../types/employeeReview";

export const employeeReviewApi = {
	/**
	 * Get comprehensive employee review
	 */
	getEmployeeReview: async (filters: EmployeeReviewFilters) => {
		const { userId, dateFrom, dateTo } = filters;

		const params: Record<string, string> = {};
		if (dateFrom) params.dateFrom = dateFrom;
		if (dateTo) params.dateTo = dateTo;

		const response = await api.get<ApiResponse<EmployeeReviewData>>(`/admin/stats/employee-review/${userId}`, { params });

		return response.data;
	},
};
