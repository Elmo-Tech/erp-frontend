import { useQuery } from "@tanstack/react-query";
import { codeReviewApi } from "../api/codeReviewApi";

export function useMyCodeReviewStats(startDate?: string, endDate?: string, enabled = true) {
	return useQuery({
		queryKey: ["myStats", startDate, endDate],
		queryFn: () => codeReviewApi.getMyStats(startDate, endDate).then((response) => response.data.data),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
