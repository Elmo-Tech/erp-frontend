import api from "@/lib/axios";

export interface SalesPerformance {
	userId: number;
	userName?: string;
	leadsCount: number;
	convertedCount: number;
	conversionRate: number;
	totalValue: number;
	totalCommission: number;
}

export interface SourceAnalytics {
	source: string;
	leadsCount: number;
	convertedCount: number;
	conversionRate: number;
	totalValue: number;
	avgDealSize: number;
}

export interface PipelineStage {
	status: string;
	label: string;
	count: number;
	value: number;
}

export interface RevenueForecast {
	milestonesDue: {
		milestoneId: number;
		contractId: number;
		projectName: string;
		milestoneTitle: string;
		amount: number;
		dueDate: string;
		status: string;
	}[];
	forecast: {
		thisMonth: number;
		nextMonth: number;
		thisQuarter: number;
	};
}

export interface QuotationStats {
	total: number;
	totalValue: number;
	avgValue: number;
	byStatus: Record<string, { count: number; value: number }>;
	rejectionReasons: Record<string, number>;
	conversionRate: number;
}

export interface ProjectTypeBreakdown {
	type: string;
	count: number;
	percentage: number;
	totalValue: number;
	avgValue: number;
}

export const analyticsApi = {
	getSalesPerformance: async (
		startDate?: string,
		endDate?: string
	): Promise<{
		period: { startDate: string; endDate: string };
		salesReps: SalesPerformance[];
	}> => {
		const params = new URLSearchParams();
		if (startDate) params.append("startDate", startDate);
		if (endDate) params.append("endDate", endDate);

		const response = await api.get<{ data: { period: { startDate: string; endDate: string }; salesReps: SalesPerformance[] } }>(`/analytics/sales/performance?${params.toString()}`);
		return response.data.data;
	},

	getSourceAnalytics: async (
		startDate?: string,
		endDate?: string
	): Promise<{
		period: { startDate: string; endDate: string };
		sources: SourceAnalytics[];
	}> => {
		const params = new URLSearchParams();
		if (startDate) params.append("startDate", startDate);
		if (endDate) params.append("endDate", endDate);

		const response = await api.get<{ data: { period: { startDate: string; endDate: string }; sources: SourceAnalytics[] } }>(`/analytics/sales/sources?${params.toString()}`);
		return response.data.data;
	},

	getPipeline: async (): Promise<{ stages: PipelineStage[] }> => {
		const response = await api.get<{ data: { stages: PipelineStage[] } }>("/analytics/sales/pipeline");
		return response.data.data;
	},

	getRevenueForecast: async (): Promise<RevenueForecast> => {
		const response = await api.get<{ data: RevenueForecast }>("/analytics/revenue/forecast");
		return response.data.data;
	},

	getQuotationStats: async (startDate?: string, endDate?: string): Promise<QuotationStats> => {
		const params = new URLSearchParams();
		if (startDate) params.append("startDate", startDate);
		if (endDate) params.append("endDate", endDate);

		const response = await api.get<{ data: QuotationStats }>(`/analytics/quotations/stats?${params.toString()}`);
		return response.data.data;
	},

	getProjectTypes: async (): Promise<{ types: ProjectTypeBreakdown[] }> => {
		const response = await api.get<{ data: { types: ProjectTypeBreakdown[] } }>("/analytics/projects/types");
		return response.data.data;
	},
};
