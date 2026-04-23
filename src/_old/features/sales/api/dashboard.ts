import api from "@/shared/api/base";
import type { DashboardSummaryResponse, PipelineHealthResponse, TeamPerformanceResponse, BottleneckAnalysisResponse, AlertsResponse, TeamPerformanceParams } from "../types/dashboard";

const BASE_URL = "/sales-dashboard";

/**
 * Get dashboard summary (pipeline + alerts + today's schedule)
 */
export const getDashboardSummary = async (): Promise<DashboardSummaryResponse> => {
	const response = await api.get<DashboardSummaryResponse>(`${BASE_URL}/summary`);
	return response.data;
};

/**
 * Get pipeline health metrics
 */
export const getPipelineHealth = async (): Promise<PipelineHealthResponse> => {
	const response = await api.get<PipelineHealthResponse>(`${BASE_URL}/pipeline`);
	return response.data;
};

/**
 * Get team performance metrics
 */
export const getTeamPerformance = async (params?: TeamPerformanceParams): Promise<TeamPerformanceResponse> => {
	const response = await api.get<TeamPerformanceResponse>(`${BASE_URL}/team-performance`, { params });
	return response.data;
};

/**
 * Get bottleneck analysis
 */
export const getBottleneckAnalysis = async (): Promise<BottleneckAnalysisResponse> => {
	const response = await api.get<BottleneckAnalysisResponse>(`${BASE_URL}/bottlenecks`);
	return response.data;
};

/**
 * Get sales alerts
 */
export const getAlerts = async (): Promise<AlertsResponse> => {
	const response = await api.get<AlertsResponse>(`${BASE_URL}/alerts`);
	return response.data;
};
