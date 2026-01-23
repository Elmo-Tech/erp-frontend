import { useQuery } from "@tanstack/react-query";
import { getMyInnovationSummary } from "../api";

interface UseMyInnovationSummaryOptions {
	startDate?: string;
	endDate?: string;
}

export function useMyInnovationSummary(options?: UseMyInnovationSummaryOptions) {
	return useQuery({
		queryKey: ["myInnovationSummary", options],
		queryFn: () => getMyInnovationSummary(options?.startDate, options?.endDate),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
