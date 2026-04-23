import { useQuery, useMutation } from "@tanstack/react-query";
import { globalSearch, exportLeads, exportProposals, exportQuotations, generateSalesReport, downloadBlob } from "../api/search";
import type { SearchParams, ExportFilters, ExportFormat } from "../types/search";
import { useState, useCallback } from "react";
import { useDebounce } from "@/shared/hooks/useDebounce";

// Query keys
export const searchKeys = {
	all: ["search"] as const,
	global: (query: string) => [...searchKeys.all, "global", query] as const,
	report: (startDate: string, endDate: string) => [...searchKeys.all, "report", startDate, endDate] as const,
};

/**
 * Hook for global search with debounce
 */
export const useGlobalSearch = (initialQuery = "") => {
	const [query, setQuery] = useState(initialQuery);
	const debouncedQuery = useDebounce(query, 300);

	const searchQuery = useQuery({
		queryKey: searchKeys.global(debouncedQuery),
		queryFn: () => globalSearch({ q: debouncedQuery }),
		enabled: debouncedQuery.length >= 2,
		staleTime: 1000 * 60, // 1 minute
	});

	return {
		query,
		setQuery,
		...searchQuery,
	};
};

/**
 * Hook for exporting leads
 */
export const useExportLeads = () => {
	return useMutation({
		mutationFn: async ({ filters, format }: { filters?: ExportFilters; format?: ExportFormat }) => {
			const result = await exportLeads(filters, format);
			if (format === "csv" && result instanceof Blob) {
				downloadBlob(result, `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
				return { downloaded: true };
			}
			return result;
		},
	});
};

/**
 * Hook for exporting proposals
 */
export const useExportProposals = () => {
	return useMutation({
		mutationFn: async ({ filters, format }: { filters?: ExportFilters; format?: ExportFormat }) => {
			const result = await exportProposals(filters, format);
			if (format === "csv" && result instanceof Blob) {
				downloadBlob(result, `proposals_export_${new Date().toISOString().slice(0, 10)}.csv`);
				return { downloaded: true };
			}
			return result;
		},
	});
};

/**
 * Hook for exporting quotations
 */
export const useExportQuotations = () => {
	return useMutation({
		mutationFn: async ({ filters, format }: { filters?: ExportFilters; format?: ExportFormat }) => {
			const result = await exportQuotations(filters, format);
			if (format === "csv" && result instanceof Blob) {
				downloadBlob(result, `quotations_export_${new Date().toISOString().slice(0, 10)}.csv`);
				return { downloaded: true };
			}
			return result;
		},
	});
};

/**
 * Hook for generating sales report
 */
export const useSalesReport = (startDate: string, endDate: string, enabled = true) => {
	return useQuery({
		queryKey: searchKeys.report(startDate, endDate),
		queryFn: () => generateSalesReport(startDate, endDate),
		enabled: enabled && !!startDate && !!endDate,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};
