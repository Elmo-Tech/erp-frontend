import { useQuery } from "@tanstack/react-query";
import { getPendingInnovationLogs } from "../api";

export function usePendingInnovationLogs() {
	return useQuery({
		queryKey: ["pendingInnovationLogs"],
		queryFn: () => getPendingInnovationLogs(),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}
