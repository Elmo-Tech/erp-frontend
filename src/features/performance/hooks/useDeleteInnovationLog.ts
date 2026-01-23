import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteInnovationLog } from "../api";

export function useDeleteInnovationLog() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (logId: number) => deleteInnovationLog(logId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["innovationLogs"] });
			queryClient.invalidateQueries({ queryKey: ["pendingInnovationLogs"] });
			queryClient.invalidateQueries({ queryKey: ["myInnovationSummary"] });
			toast.success("Innovation log deleted");
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to delete innovation log";
			toast.error(message);
		},
	});
}
