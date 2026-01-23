import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { verifyInnovationLog } from "../api";

export function useVerifyInnovationLog() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (logId: number) => verifyInnovationLog(logId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["innovationLogs"] });
			queryClient.invalidateQueries({ queryKey: ["pendingInnovationLogs"] });
			queryClient.invalidateQueries({ queryKey: ["myInnovationSummary"] });
			toast.success("Innovation log verified successfully");
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to verify innovation log";
			toast.error(message);
		},
	});
}
