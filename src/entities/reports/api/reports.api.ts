import api from "@/shared/api/base";
import type { ExecutiveOverviewReport, ProjectProfitabilityReport, ReportFilters, ReportKey, SalesFinanceReport, TeamTimeReport } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

export function buildReportParams(filters?: ReportFilters): URLSearchParams {
	const params = new URLSearchParams();

	if (filters?.from) params.append("from", filters.from);
	if (filters?.to) params.append("to", filters.to);
	if (filters?.projectId) params.append("projectId", String(filters.projectId));
	if (filters?.clientId) params.append("clientId", String(filters.clientId));
	if (filters?.userId) params.append("userId", String(filters.userId));
	if (filters?.status) params.append("status", filters.status);

	return params;
}

function withQuery(path: string, filters?: ReportFilters): string {
	const query = buildReportParams(filters).toString();
	return query ? `${path}?${query}` : path;
}

export const reportsApi = {
	async getOverview(filters?: ReportFilters): Promise<ExecutiveOverviewReport> {
		const response = await api.get<ApiEnvelope<ExecutiveOverviewReport>>(withQuery("/reports/overview", filters));
		return response.data.data;
	},

	async getProjects(filters?: ReportFilters): Promise<ProjectProfitabilityReport> {
		const response = await api.get<ApiEnvelope<ProjectProfitabilityReport>>(withQuery("/reports/projects", filters));
		return response.data.data;
	},

	async getTeamTime(filters?: ReportFilters): Promise<TeamTimeReport> {
		const response = await api.get<ApiEnvelope<TeamTimeReport>>(withQuery("/reports/team-time", filters));
		return response.data.data;
	},

	async getSalesFinance(filters?: ReportFilters): Promise<SalesFinanceReport> {
		const response = await api.get<ApiEnvelope<SalesFinanceReport>>(withQuery("/reports/sales-finance", filters));
		return response.data.data;
	},

	exportCsv(report: ReportKey, filters?: ReportFilters): string {
		const params = new URLSearchParams({ report });
		buildReportParams(filters).forEach((value, key) => params.append(key, value));
		return `/reports/export?${params.toString()}`;
	},
};
