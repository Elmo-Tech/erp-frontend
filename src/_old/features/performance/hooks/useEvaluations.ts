import { useQuery } from "@tanstack/react-query";
import { getEvaluations } from "../api";
import type { EvaluationStatus, BonusTier } from "../types";

interface UseEvaluationsFilters {
	periodId?: number;
	status?: EvaluationStatus;
	bonusTier?: BonusTier;
	perPage?: number;
}

export function useEvaluations(filters?: UseEvaluationsFilters) {
	return useQuery({
		queryKey: ["evaluations", filters],
		queryFn: () => getEvaluations(filters),
		staleTime: 0, // Always fetch fresh data when filters change
	});
}
