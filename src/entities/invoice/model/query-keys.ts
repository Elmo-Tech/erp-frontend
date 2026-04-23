import type { InvoiceFilters } from "./types";

export const invoiceKeys = {
	all: ["invoices"] as const,
	lists: () => [...invoiceKeys.all, "list"] as const,
	list: (filters?: InvoiceFilters) => [...invoiceKeys.lists(), filters] as const,
	details: () => [...invoiceKeys.all, "detail"] as const,
	detail: (id: number) => [...invoiceKeys.details(), id] as const,
	downloads: () => [...invoiceKeys.all, "download"] as const,
	download: (id: number) => [...invoiceKeys.downloads(), id] as const,
};
