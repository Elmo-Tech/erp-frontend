import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to approve evaluation";
			toast.error(message);
		},
	});
}
