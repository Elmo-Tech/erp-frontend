import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { codeReviewApi } from "../api/codeReviewApi";
import type { CreateCodeReviewData } from "../types/codeReview";

export function useCreateCodeReview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCodeReviewData) => codeReviewApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["codeReviews"] });
			queryClient.invalidateQueries({ queryKey: ["myPendingReviews"] });
			toast.success("Code review created successfully");
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error, "Failed to create code review"));
		},
	});
}
