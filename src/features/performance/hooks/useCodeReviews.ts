import { useQuery } from "@tanstack/react-query";
import { codeReviewApi } from "../api/codeReviewApi";
import type { CodeReviewFilters } from "../types/codeReview";

export function useCodeReviews(filters?: CodeReviewFilters & { perPage?: number; page?: number }, enabled = true) {
	return useQuery({
		queryKey: ["codeReviews", filters],
		queryFn: () => codeReviewApi.getAll(filters).then((response) => response.data.data),
		enabled,
		staleTime: 0, // Always fetch fresh data when filters change
	});
}
