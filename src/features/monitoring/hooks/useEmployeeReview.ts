import { useQuery } from "@tanstack/react-query";
import { employeeReviewApi } from "../api/employeeReviewApi";
import { EmployeeReviewFilters } from "../types/employeeReview";

export function useEmployeeReview(filters: EmployeeReviewFilters) {
	return useQuery({
		queryKey: ["employee-review", filters],
		queryFn: async () => {
			console.log("Fetching employee review with filters:", filters);
			try {
				const result = await employeeReviewApi.getEmployeeReview(filters);
				console.log("Employee review API response:", result);
				return result;
			} catch (error) {
				console.error("Employee review API error:", error);
				throw error;
			}
		},
		enabled: !!filters.userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
