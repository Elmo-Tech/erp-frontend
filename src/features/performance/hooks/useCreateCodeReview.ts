import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { codeReviewApi } from "../api/codeReviewApi";
import type { CreateCodeReviewData } from "../types/codeReview";

export function useCreateCodeReview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCodeReviewData) => codeReviewApi.create(data),
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: ["codeReviews"] });
			queryClient.invalidateQueries({ queryKey: ["myPendingReviews"] });
			toast.success("Code review created successfully");
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to create code review";
			toast.error(message);
		},
	});
}
