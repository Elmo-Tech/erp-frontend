/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { codeReviewApi } from "../api/codeReviewApi";

export function useApproveCodeReview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => codeReviewApi.approve(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["codeReviews"] });
			queryClient.invalidateQueries({ queryKey: ["myPendingReviews"] });
			queryClient.invalidateQueries({ queryKey: ["myStats"] });
			toast.success("Code review approved successfully");
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to approve code review";
			toast.error(message);
		},
	});
}

export function useRequestRevision() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, suggestions }: { id: number; suggestions: string }) => codeReviewApi.requestRevision(id, suggestions),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["codeReviews"] });
			queryClient.invalidateQueries({ queryKey: ["myPendingReviews"] });
			toast.success("Revision requested successfully");
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to request revision";
			toast.error(message);
		},
	});
}

export function useRejectCodeReview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, reason }: { id: number; reason: string }) => codeReviewApi.reject(id, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["codeReviews"] });
			queryClient.invalidateQueries({ queryKey: ["myPendingReviews"] });
			queryClient.invalidateQueries({ queryKey: ["myStats"] });
			toast.success("Code review rejected");
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to reject code review";
			toast.error(message);
		},
	});
}
