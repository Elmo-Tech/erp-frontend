/**
 * Global Search Types
 */

export type SearchEntityType = "lead" | "proposal" | "quotation" | "client" | "project";

export interface SearchResult {
	id: number;
	type: SearchEntityType;
	title: string;
	subtitle: string | null;
	status: string | null;
	url: string;
	createdAt: string;
}

export interface SearchResults {
	leads?: SearchResult[];
	proposals?: SearchResult[];
	quotations?: SearchResult[];
	clients?: SearchResult[];
	projects?: SearchResult[];
}

export interface GlobalSearchResponse {
	success: boolean;
	message: string;
	data: {
		results: SearchResults;
		totalCount: number;
		query: string;
	};
}

export interface SearchParams {
	q: string;
	types?: SearchEntityType[];
	limit?: number;
}

/**
 * Export Types
 */

export interface ExportFilters {
	status?: string;
	startDate?: string;
	endDate?: string;
	source?: string;
}

export interface ExportData {
	headers: string[];
	data: (string | number | null)[][];
	filename: string;
	totalCount: number;
}

export interface ExportResponse {
	success: boolean;
	message: string;
	data: ExportData;
}

export interface SalesReportData {
	period: {
		startDate: string;
		endDate: string;
	};
	leads: {
		created: number;
		won: number;
		lost: number;
		conversionRate: number;
	};
	proposals: {
		created: number;
		approved: number;
		rejected: number;
		approvalRate: number;
	};
	quotations: {
		created: number;
		approved: number;
		totalValue: number;
		approvalRate: number;
	};
	generatedAt: string;
}

export interface SalesReportResponse {
	success: boolean;
	message: string;
	data: SalesReportData;
}

export type ExportFormat = "json" | "csv";
