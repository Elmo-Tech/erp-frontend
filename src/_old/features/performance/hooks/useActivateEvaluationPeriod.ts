/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { activateEvaluationPeriod } from "../api";

export function useActivateEvaluationPeriod() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (periodId: number) => activateEvaluationPeriod(periodId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["evaluationPeriods"] });
			toast.success("Evaluation period activated successfully");
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to activate evaluation period";
			toast.error(message);
		},
	});
}
