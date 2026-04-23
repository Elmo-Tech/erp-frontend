import api from "@/shared/api/base";
import { ApiResponse } from "@/_old/features/monitoring/types/api";
import { EmployeeReviewData, EmployeeReviewFilters } from "../types/employeeReview";

export const employeeReviewApi = {
	/**
	 * Get comprehensive employee review
	 */
	getEmployeeReview: async (filters: EmployeeReviewFilters) => {
		const { userId, dateFrom, dateTo, page, perPage } = filters;

		const params: Record<string, string> = {};
		if (dateFrom) params.dateFrom = dateFrom;
		if (dateTo) params.dateTo = dateTo;
		if (page) params.page = String(page);
		if (perPage) params.perPage = String(perPage);

		const response = await api.get<ApiResponse<EmployeeReviewData>>(`/admin/stats/employee-review/${userId}`, { params });

		return response.data;
	},
};
