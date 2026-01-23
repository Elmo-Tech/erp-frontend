import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rejectInnovationLog } from "../api";

export function useRejectInnovationLog() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (logId: number) => rejectInnovationLog(logId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["innovationLogs"] });
			queryClient.invalidateQueries({ queryKey: ["pendingInnovationLogs"] });
			queryClient.invalidateQueries({ queryKey: ["myInnovationSummary"] });
			toast.success("Innovation log rejected");
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to reject innovation log";
			toast.error(message);
		},
	});
}
