import { useQuery } from "@tanstack/react-query";
import { getPeriodBonuses } from "../api";

export function usePeriodBonuses(periodId: number) {
	return useQuery({
		queryKey: ["periodBonuses", periodId],
		queryFn: () => getPeriodBonuses(periodId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!periodId && periodId > 0,
	});
}
