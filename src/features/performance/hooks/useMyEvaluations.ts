import { useQuery } from "@tanstack/react-query";
import { getMyEvaluations } from "../api";

interface UseMyEvaluationsOptions {
	perPage?: number;
}

export function useMyEvaluations(options?: UseMyEvaluationsOptions) {
	return useQuery({
		queryKey: ["myEvaluations", options],
		queryFn: () => getMyEvaluations(options?.perPage),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
