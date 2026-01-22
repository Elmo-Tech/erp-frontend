/* eslint-disable @typescript-eslint/no-unused-vars */
import { api } from "@/lib/axios";
import {
	AddPointsFormData,
	DeductPointsFormData,
	SetPointsFormData,
	UserPointsFilters,
	UserPointsHistoryResponse,
	UsersWithPointsResponse,
	LeaderboardUser,
	PointsStatistics,
	UserPoint,
	PointsReportFilters,
	PointsReportResponse,
	PointTransactionTypeOption,
	UnifiedPointsHistoryResponse,
} from "../types/userPoints";

export const userPointsApi = {
	// Get all users with their points
	getAllUsersWithPoints: async (filters: UserPointsFilters = {}, page = 1, perPage = 15): Promise<UsersWithPointsResponse> => {
		const params = new URLSearchParams({
			page: page.toString(),
			perPage: perPage.toString(),
			...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "")),
		});

		const response = await api.get(`/user-points?${params}`);
		return response.data.data;
	},

	// Add points to a user
	addPoints: async (data: AddPointsFormData): Promise<UserPoint> => {
		const response = await api.post("/user-points/add", data);
		return response.data.data;
	},

	// Deduct points from a user
	deductPoints: async (data: DeductPointsFormData): Promise<UserPoint> => {
		const response = await api.post("/user-points/deduct", data);
		return response.data.data;
	},

	// Set user points to specific value
	setPoints: async (data: SetPointsFormData): Promise<UserPoint> => {
		const response = await api.post("/user-points/set", data);
		return response.data.data;
	},

	// Get user points history
	getUserPointsHistory: async (userId: number, page = 1, perPage = 15): Promise<UserPointsHistoryResponse> => {
		const params = new URLSearchParams({
			page: page.toString(),
			perPage: perPage.toString(),
		});

		const response = await api.get(`/user-points/history/${userId}?${params}`);
		return response.data.data;
	},

	// Get points leaderboard
	getLeaderboard: async (limit = 10): Promise<LeaderboardUser[]> => {
		const response = await api.get(`/user-points/leaderboard?limit=${limit}`);
		return response.data.data;
	},

	// Get points statistics
	getStatistics: async (): Promise<PointsStatistics> => {
		const response = await api.get("/user-points/statistics");
		return response.data.data;
	},

	// Get points report with date range
	getPointsReport: async (filters: PointsReportFilters = {}, page = 1, perPage = 15): Promise<PointsReportResponse> => {
		const params = new URLSearchParams({
			page: page.toString(),
			perPage: perPage.toString(),
			...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "")),
		});

		const response = await api.get(`/user-points/report?${params}`);
		return response.data.data;
	},

	// Get point transaction types
	getTransactionTypes: async (): Promise<PointTransactionTypeOption[]> => {
		const response = await api.get("/user-points/transaction-types");
		return response.data.data;
	},

	// Get unified user points history (from both systems)
	getUnifiedHistory: async (userId: number, filters: { dateFrom?: string; dateTo?: string } = {}, limit = 50): Promise<UnifiedPointsHistoryResponse> => {
		const params = new URLSearchParams({
			limit: limit.toString(),
			...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "")),
		});

		const response = await api.get(`/user-points/unified-history/${userId}?${params}`);
		return response.data.data;
	},
};
