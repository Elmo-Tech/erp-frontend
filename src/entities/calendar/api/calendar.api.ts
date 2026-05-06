/**
 * entities/calendar/api/calendar.api.ts
 *
 * Raw Axios fetcher functions for the Calendar domain.
 * NO React Query hooks here — hooks live in features/calendar/model/use-calendar-actions.ts.
 *
 * All endpoints are under /api/v1/calendar/* and require auth:sanctum + view_calendar.
 */

import api from "@/shared/api/base";
import type { AggregatedCalendarResponse, ApiEnvelope, CalendarAggregatorParams, CalendarEvent, CreateCalendarEventPayload, UpdateCalendarEventPayload } from "@/entities/calendar/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Master Calendar Aggregator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the unified calendar feed (Events + ProjectTasks + FinanceInvoices)
 * for the given date range.
 *
 * GET /calendar?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export async function fetchCalendarFeed(params: CalendarAggregatorParams): Promise<AggregatedCalendarResponse> {
	const res = await api.get<ApiEnvelope<AggregatedCalendarResponse>>("/calendar", {
		params: {
			startDate: params.startDate,
			endDate: params.endDate,
		},
	});
	return res.data.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendar Events CRUD
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchCalendarEvent(id: number): Promise<CalendarEvent> {
	const res = await api.get<ApiEnvelope<CalendarEvent>>(`/calendar/events/${id}`);
	return res.data.data;
}

export async function postCalendarEvent(payload: CreateCalendarEventPayload): Promise<CalendarEvent> {
	const res = await api.post<ApiEnvelope<CalendarEvent>>("/calendar/events", payload);
	return res.data.data;
}

export async function putCalendarEvent(id: number, payload: UpdateCalendarEventPayload): Promise<CalendarEvent> {
	const res = await api.put<ApiEnvelope<CalendarEvent>>(`/calendar/events/${id}`, payload);
	return res.data.data;
}

export async function deleteCalendarEvent(id: number): Promise<void> {
	await api.delete(`/calendar/events/${id}`);
}
