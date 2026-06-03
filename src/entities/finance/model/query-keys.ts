/**
 * entities/finance/model/query-keys.ts
 *
 * Canonical React Query key factories for the Finance domain.
 * Follows the same factory pattern as hrAdminKeys, clientKeys, etc.
 */

export const financeKeys = {
	all: ["finance"] as const,

	// Invoices
	invoices: () => [...financeKeys.all, "invoices"] as const,
	invoiceList: (params?: unknown) => [...financeKeys.invoices(), "list", params] as const,
	invoiceDetail: (id: number) => [...financeKeys.invoices(), id] as const,

	// Subscriptions
	subscriptions: () => [...financeKeys.all, "subscriptions"] as const,
	subscriptionList: (params?: unknown) => [...financeKeys.subscriptions(), "list", params] as const,
	subscriptionDetail: (id: number) => [...financeKeys.subscriptions(), id] as const,
};
