/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createEvaluationPeriod } from "../api";
import type { CreateEvaluationPeriodRequest } from "../types";

export function useCreateEvaluationPeriod() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateEvaluationPeriodRequest) => createEvaluationPeriod(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["evaluationPeriods"] });
			toast.success("Evaluation period created successfully");
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to create evaluation period";
			toast.error(message);
		},
	});
}
