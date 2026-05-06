/**
 * features/calendar/model/use-calendar-actions.ts
 *
 * All React Query hooks (queries + mutations) for the Calendar domain.
 * Imports raw fetchers from entities/calendar/api/calendar.api.ts.
 *
 * Mutation hooks MUST call queryClient.invalidateQueries on success (No Refresh Rule).
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { calendarKeys } from "@/entities/calendar/model/query-keys";
import * as calendarApi from "@/entities/calendar/api/calendar.api";
import type { CalendarAggregatorParams, CreateCalendarEventPayload, UpdateCalendarEventPayload } from "@/entities/calendar/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Aggregated Calendar Feed
// ─────────────────────────────────────────────────────────────────────────────

export function useCalendarFeed(params: CalendarAggregatorParams) {
	return useQuery({
		queryKey: calendarKeys.feedByRange(params.startDate, params.endDate),
		queryFn: () => calendarApi.fetchCalendarFeed(params),
		staleTime: 2 * 60 * 1000,
		enabled: Boolean(params.startDate && params.endDate),
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendar Event Mutations
// ─────────────────────────────────────────────────────────────────────────────

export function useCreateCalendarEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateCalendarEventPayload) => calendarApi.postCalendarEvent(payload),
		onSuccess: () => {
			// Invalidate the entire feed so all date ranges refresh
			queryClient.invalidateQueries({ queryKey: calendarKeys.feed() });
		},
	});
}

export function useUpdateCalendarEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateCalendarEventPayload }) => calendarApi.putCalendarEvent(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: calendarKeys.feed() });
		},
	});
}

export function useDeleteCalendarEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => calendarApi.deleteCalendarEvent(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: calendarKeys.feed() });
		},
	});
}
