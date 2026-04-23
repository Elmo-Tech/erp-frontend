import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api";

const PERFORMANCE_KEY = "sales-performance";
const SOURCES_KEY = "sales-sources";
const PIPELINE_KEY = "sales-pipeline";
const FORECAST_KEY = "revenue-forecast";
const QUOTATION_STATS_KEY = "quotation-stats";
const PROJECT_TYPES_KEY = "project-types";

export function useSalesPerformance(startDate?: string, endDate?: string) {
	return useQuery({
		queryKey: [PERFORMANCE_KEY, startDate, endDate],
		queryFn: () => analyticsApi.getSalesPerformance(startDate, endDate),
	});
}

export function useSourceAnalytics(startDate?: string, endDate?: string) {
	return useQuery({
		queryKey: [SOURCES_KEY, startDate, endDate],
		queryFn: () => analyticsApi.getSourceAnalytics(startDate, endDate),
	});
}

export function useSalesPipeline() {
	return useQuery({
		queryKey: [PIPELINE_KEY],
		queryFn: () => analyticsApi.getPipeline(),
	});
}

export function useRevenueForecast() {
	return useQuery({
		queryKey: [FORECAST_KEY],
		queryFn: () => analyticsApi.getRevenueForecast(),
	});
}

export function useQuotationStats(startDate?: string, endDate?: string) {
	return useQuery({
		queryKey: [QUOTATION_STATS_KEY, startDate, endDate],
		queryFn: () => analyticsApi.getQuotationStats(startDate, endDate),
	});
}

export function useProjectTypesBreakdown() {
	return useQuery({
		queryKey: [PROJECT_TYPES_KEY],
		queryFn: () => analyticsApi.getProjectTypes(),
	});
}
