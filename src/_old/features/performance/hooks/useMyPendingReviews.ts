import { useQuery } from "@tanstack/react-query";
import { codeReviewApi } from "../api/codeReviewApi";

export function useMyPendingReviews(enabled = true) {
	return useQuery({
		queryKey: ["myPendingReviews"],
		queryFn: () => codeReviewApi.getMyPending().then((response) => response.data.data),
		enabled,
		staleTime: 30 * 1000, // 30 seconds
		refetchInterval: 60 * 1000, // Refetch every minute for pending reviews
	});
}
