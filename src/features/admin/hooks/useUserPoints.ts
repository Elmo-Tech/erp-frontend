/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userPointsApi } from "../api/userPointsApi";
import { AddPointsFormData, DeductPointsFormData, SetPointsFormData, UserPointsFilters } from "../types/userPoints";

// Query Keys
export const userPointsKeys = {
	all: ["userPoints"] as const,
	lists: () => [...userPointsKeys.all, "list"] as const,
	list: (filters: UserPointsFilters, page: number, perPage: number) => [...userPointsKeys.lists(), { filters, page, perPage }] as const,
	history: (userId: number, page: number, perPage: number) => [...userPointsKeys.all, "history", userId, { page, perPage }] as const,
	leaderboard: (limit: number) => [...userPointsKeys.all, "leaderboard", limit] as const,
	statistics: () => [...userPointsKeys.all, "statistics"] as const,
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

// Add points mutation
export function useAddPoints() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: AddPointsFormData) => userPointsApi.addPoints(data),
		onSuccess: () => {
			toast.success("Points added successfully");
			queryClient.invalidateQueries({ queryKey: userPointsKeys.all });
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
			queryClient.invalidateQueries({ queryKey: userPointsKeys.all });
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
			queryClient.invalidateQueries({ queryKey: userPointsKeys.all });
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to set points";
			toast.error(message);
		},
	});
}
