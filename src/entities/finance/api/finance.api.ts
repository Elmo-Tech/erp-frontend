/**
 * entities/finance/api/finance.api.ts
 *
 * Raw Axios fetcher functions for the Finance domain.
 * NO React Query hooks here — hooks live in features/finance/model/use-finance-actions.ts.
 *
 * All endpoints are under /api/v1/finance/* and require auth:sanctum.
 *
 * NOTE: Both index endpoints use ->paginate() on the backend, which returns
 * a paginated collection via ->response()->getData(true):
 *   { data: { data: [...items], meta: {...} }, message, success }
 * List fetchers return the PaginatedResponse<T> object (not unwrapped array)
 * so widgets can access both .data and .meta if needed.
 */

import api from "@/shared/api/base";
import type { ApiEnvelope, CreateInvoicePayload, CreateSubscriptionPayload, Invoice, Subscription, UpdateInvoicePayload, UpdateSubscriptionPayload } from "@/entities/finance/model/types";

// Paginated response shape (matches entities/hr/model/types.ts)
interface PaginatedResponse<T> {
	data: T[];
	meta: {
		total: number;
		count: number;
		current_page: number;
		last_page: number;
		per_page: number;
	};
}

// ─────────────────────────────────────────────────────────────────────────────
// Finance Invoices
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchInvoices(): Promise<PaginatedResponse<Invoice>> {
	const res = await api.get<ApiEnvelope<PaginatedResponse<Invoice>>>("/finance/invoices");
	return res.data.data;
}

export async function fetchInvoice(id: number): Promise<Invoice> {
	const res = await api.get<ApiEnvelope<Invoice>>(`/finance/invoices/${id}`);
	return res.data.data;
}

export async function postInvoice(payload: CreateInvoicePayload): Promise<Invoice> {
	const res = await api.post<ApiEnvelope<Invoice>>("/finance/invoices", payload);
	return res.data.data;
}

export async function putInvoice(id: number, payload: UpdateInvoicePayload): Promise<Invoice> {
	const res = await api.put<ApiEnvelope<Invoice>>(`/finance/invoices/${id}`, payload);
	return res.data.data;
}

export async function deleteInvoice(id: number): Promise<void> {
	await api.delete(`/finance/invoices/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SaaS Subscriptions
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchSubscriptions(): Promise<PaginatedResponse<Subscription>> {
	const res = await api.get<ApiEnvelope<PaginatedResponse<Subscription>>>("/finance/subscriptions");
	return res.data.data;
}

export async function fetchSubscription(id: number): Promise<Subscription> {
	const res = await api.get<ApiEnvelope<Subscription>>(`/finance/subscriptions/${id}`);
	return res.data.data;
}

export async function postSubscription(payload: CreateSubscriptionPayload): Promise<Subscription> {
	const res = await api.post<ApiEnvelope<Subscription>>("/finance/subscriptions", payload);
	return res.data.data;
}

export async function putSubscription(id: number, payload: UpdateSubscriptionPayload): Promise<Subscription> {
	const res = await api.put<ApiEnvelope<Subscription>>(`/finance/subscriptions/${id}`, payload);
	return res.data.data;
}

export async function deleteSubscription(id: number): Promise<void> {
	await api.delete(`/finance/subscriptions/${id}`);
}
