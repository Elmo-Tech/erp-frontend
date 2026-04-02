import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { approveEvaluation } from "../api";

interface ApproveEvaluationParams {
	id: number;
	notes?: string;
}

export function useApproveEvaluation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, notes }: ApproveEvaluationParams) => approveEvaluation(id, notes),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["evaluations"] });
			queryClient.invalidateQueries({ queryKey: ["myEvaluations"] });
			toast.success("Evaluation approved successfully");
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error, "Failed to approve evaluation"));
		},
	});
}
