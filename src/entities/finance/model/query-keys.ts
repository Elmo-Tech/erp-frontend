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
	invoiceList: (params?: { clientId?: number }) => (params?.clientId ? ([...financeKeys.invoices(), "list", { clientId: params.clientId }] as const) : ([...financeKeys.invoices(), "list"] as const)),
	invoiceDetail: (id: number) => [...financeKeys.invoices(), id] as const,

	// Subscriptions
	subscriptions: () => [...financeKeys.all, "subscriptions"] as const,
	subscriptionList: () => [...financeKeys.subscriptions(), "list"] as const,
	subscriptionDetail: (id: number) => [...financeKeys.subscriptions(), id] as const,
};
