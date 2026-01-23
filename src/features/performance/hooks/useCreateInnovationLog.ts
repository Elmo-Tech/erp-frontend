import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createInnovationLog } from "../api";
import type { CreateInnovationLogRequest } from "../types";

export function useCreateInnovationLog() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateInnovationLogRequest) => createInnovationLog(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["innovationLogs"] });
			queryClient.invalidateQueries({ queryKey: ["pendingInnovationLogs"] });
			queryClient.invalidateQueries({ queryKey: ["myInnovationSummary"] });
			toast.success("Innovation log created successfully");
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to create innovation log";
			toast.error(message);
		},
	});
}
