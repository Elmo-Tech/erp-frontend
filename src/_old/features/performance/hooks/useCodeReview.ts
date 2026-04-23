import { useQuery } from "@tanstack/react-query";
import { codeReviewApi } from "../api/codeReviewApi";

export function useCodeReview(id: number, enabled = true) {
	return useQuery({
		queryKey: ["codeReview", id],
		queryFn: () => codeReviewApi.getById(id).then((response) => response.data.data),
		enabled: enabled && id > 0,
		staleTime: 30 * 1000, // 30 seconds
	});
}
