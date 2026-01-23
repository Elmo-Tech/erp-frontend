/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userPointsApi } from "../api/userPointsApi";
import { AddPointsFormData, DeductPointsFormData, SetPointsFormData, UserPointsFilters, PointsReportFilters, PointTransactionTypeOption } from "../types/userPoints";

// Query Keys
export const userPointsKeys = {
	all: ["userPoints"] as const,
	lists: () => [...userPointsKeys.all, "list"] as const,
	list: (filters: UserPointsFilters, page: number, perPage: number) => [...userPointsKeys.lists(), { filters, page, perPage }] as const,
	history: (userId: number, page: number, perPage: number) => [...userPointsKeys.all, "history", userId, { page, perPage }] as const,
	leaderboard: (limit: number) => [...userPointsKeys.all, "leaderboard", limit] as const,
	statistics: () => [...userPointsKeys.all, "statistics"] as const,
	report: (filters: PointsReportFilters, page: number, perPage: number) => [...userPointsKeys.all, "report", { filters, page, perPage }] as const,
	transactionTypes: () => [...userPointsKeys.all, "transactionTypes"] as const,
};

// Get all users with points
export function useUsersWithPoints(filters: UserPointsFilters = {}, page = 1, perPage = 15) {
	return useQuery({
		queryKey: userPointsKeys.list(filters, page, perPage),
		queryFn: () => userPointsApi.getAllUsersWithPoints(filters, page, perPage),
	});
}

// Get user points history
export function useUserPointsHistory(userId: number, page = 1, perPage = 15) {
	return useQuery({
		queryKey: userPointsKeys.history(userId, page, perPage),
		queryFn: () => userPointsApi.getUserPointsHistory(userId, page, perPage),
		enabled: !!userId,
	});
}

// Get leaderboard
export function useLeaderboard(limit = 10) {
	return useQuery({
		queryKey: userPointsKeys.leaderboard(limit),
		queryFn: () => userPointsApi.getLeaderboard(limit),
	});
}

// Get statistics
export function usePointsStatistics() {
	return useQuery({
		queryKey: userPointsKeys.statistics(),
		queryFn: () => userPointsApi.getStatistics(),
	});
}

// Get points report
export function usePointsReport(filters: PointsReportFilters = {}, page = 1, perPage = 15) {
	return useQuery({
		queryKey: userPointsKeys.report(filters, page, perPage),
		queryFn: () => userPointsApi.getPointsReport(filters, page, perPage),
	});
}

// Get point transaction types
export function usePointTransactionTypes() {
	return useQuery<PointTransactionTypeOption[]>({
		queryKey: userPointsKeys.transactionTypes(),
		queryFn: () => userPointsApi.getTransactionTypes(),
	});
}

// Get unified user points history
export function useUnifiedPointsHistory(userId: number, filters: { dateFrom?: string; dateTo?: string } = {}, limit = 50) {
	return useQuery({
		queryKey: [...userPointsKeys.history(userId), "unified", filters, limit],
		queryFn: () => userPointsApi.getUnifiedHistory(userId, filters, limit),
		enabled: !!userId,
	});
}

// Add points mutation
export function useAddPoints() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: AddPointsFormData) => userPointsApi.addPoints(data),
		onSuccess: () => {
			toast.success("Points added successfully");
			// Invalidate all related queries
			queryClient.invalidateQueries({ queryKey: userPointsKeys.all });
			queryClient.invalidateQueries({ queryKey: ["employees"] });
			queryClient.invalidateQueries({ queryKey: ["users"] });
			// Force refetch to ensure immediate update
			queryClient.refetchQueries({ queryKey: ["employees"] });
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to add points";
			toast.error(message);
		},
	});
}

// Deduct points mutation
export function useDeductPoints() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: DeductPointsFormData) => userPointsApi.deductPoints(data),
		onSuccess: () => {
			toast.success("Points deducted successfully");
			// Invalidate all related queries
			queryClient.invalidateQueries({ queryKey: userPointsKeys.all });
			queryClient.invalidateQueries({ queryKey: ["employees"] });
			queryClient.invalidateQueries({ queryKey: ["users"] });
			// Force refetch to ensure immediate update
			queryClient.refetchQueries({ queryKey: ["employees"] });
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to deduct points";
			toast.error(message);
		},
	});
}

// Set points mutation
export function useSetPoints() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: SetPointsFormData) => userPointsApi.setPoints(data),
		onSuccess: () => {
			toast.success("Points set successfully");
			// Invalidate all related queries
			queryClient.invalidateQueries({ queryKey: userPointsKeys.all });
			queryClient.invalidateQueries({ queryKey: ["employees"] });
			queryClient.invalidateQueries({ queryKey: ["users"] });
			// Force refetch to ensure immediate update
			queryClient.refetchQueries({ queryKey: ["employees"] });
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to set points";
			toast.error(message);
		},
	});
}

// Delete point transaction mutation
export function useDeletePointTransaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (transactionId: string) => userPointsApi.deleteTransaction(transactionId),
		onSuccess: (data) => {
			toast.success("Transaction deleted successfully");
			// Invalidate all related queries
			queryClient.invalidateQueries({ queryKey: userPointsKeys.all });
			queryClient.invalidateQueries({ queryKey: ["employees"] });
			queryClient.invalidateQueries({ queryKey: ["users"] });
			// Force refetch to ensure immediate update
			queryClient.refetchQueries({ queryKey: ["employees"] });
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to delete transaction";
			if (error.response?.status === 403) {
				toast.error("You can only delete manual transactions");
			} else {
				toast.error(message);
			}
		},
	});
}
