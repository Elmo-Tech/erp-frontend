import api from "@/shared/api/base";
import type { GlobalSearchResponse, SearchParams, ExportResponse, ExportFilters, SalesReportResponse, ExportFormat } from "../types/search";

/**
 * Global search across all entities
 */
export const globalSearch = async (params: SearchParams): Promise<GlobalSearchResponse> => {
	const response = await api.get<GlobalSearchResponse>("/search", { params });
	return response.data;
};

/**
 * Export leads
 */
export const exportLeads = async (filters?: ExportFilters, format: ExportFormat = "json"): Promise<ExportResponse | Blob> => {
	const params = { ...filters, format };

	if (format === "csv") {
		const response = await api.get("/export/leads", {
			params,
			responseType: "blob",
		});
		return response.data;
	}

	const response = await api.get<ExportResponse>("/export/leads", { params });
	return response.data;
};

/**
 * Export proposals
 */
export const exportProposals = async (filters?: ExportFilters, format: ExportFormat = "json"): Promise<ExportResponse | Blob> => {
	const params = { ...filters, format };

	if (format === "csv") {
		const response = await api.get("/export/proposals", {
			params,
			responseType: "blob",
		});
		return response.data;
	}

	const response = await api.get<ExportResponse>("/export/proposals", { params });
	return response.data;
};

/**
 * Export quotations
 */
export const exportQuotations = async (filters?: ExportFilters, format: ExportFormat = "json"): Promise<ExportResponse | Blob> => {
	const params = { ...filters, format };

	if (format === "csv") {
		const response = await api.get("/export/quotations", {
			params,
			responseType: "blob",
		});
		return response.data;
	}

	const response = await api.get<ExportResponse>("/export/quotations", { params });
	return response.data;
};

/**
 * Generate sales report
 */
export const generateSalesReport = async (startDate: string, endDate: string): Promise<SalesReportResponse> => {
	const response = await api.get<SalesReportResponse>("/export/sales-report", {
		params: { startDate, endDate },
	});
	return response.data;
};

/**
 * Download blob as file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
};
