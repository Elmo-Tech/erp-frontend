import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { calculateEvaluation } from "../api";

export function useCalculateEvaluation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (evaluationId: number) => calculateEvaluation(evaluationId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["evaluations"] });
			queryClient.invalidateQueries({ queryKey: ["myEvaluations"] });
			toast.success("Evaluation score calculated successfully");
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error, "Failed to calculate evaluation score"));
		},
	});
}
