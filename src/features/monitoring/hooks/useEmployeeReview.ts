import { useQuery } from "@tanstack/react-query";
import { employeeReviewApi } from "../api/employeeReviewApi";
import { EmployeeReviewFilters } from "../types/employeeReview";

export function useEmployeeReview(filters: EmployeeReviewFilters) {
	return useQuery({
		queryKey: ["employee-review", filters],
		queryFn: () => employeeReviewApi.getEmployeeReview(filters),
		enabled: !!filters.userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
