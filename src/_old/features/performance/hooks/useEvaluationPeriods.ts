import { useQuery } from "@tanstack/react-query";
import { getEvaluationPeriods } from "../api";

export function useEvaluationPeriods(perPage = 15, enabled = true) {
	return useQuery({
		queryKey: ["evaluationPeriods", perPage],
		queryFn: () => getEvaluationPeriods(perPage),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
