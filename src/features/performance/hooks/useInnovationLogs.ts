import { useQuery } from "@tanstack/react-query";
import { getInnovationLogs } from "../api";
import type { InnovationCategory, ImpactLevel } from "../types";

interface UseInnovationLogsFilters {
	userId?: number;
	category?: InnovationCategory;
	isVerified?: boolean;
	impactLevel?: ImpactLevel;
	perPage?: number;
}

export function useInnovationLogs(filters?: UseInnovationLogsFilters) {
	return useQuery({
		queryKey: ["innovationLogs", filters],
		queryFn: () => getInnovationLogs(filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
