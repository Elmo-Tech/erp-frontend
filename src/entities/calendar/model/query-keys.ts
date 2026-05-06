/**
 * entities/calendar/model/query-keys.ts
 *
 * Canonical React Query key factories for the Calendar domain.
 * Follows the same factory pattern as hrAdminKeys, financeKeys, etc.
 */

export const calendarKeys = {
	all: ["calendar"] as const,

	// Aggregated feed — keyed by date range so different ranges cache separately
	feed: () => [...calendarKeys.all, "feed"] as const,
	feedByRange: (startDate: string, endDate: string) => [...calendarKeys.feed(), { startDate, endDate }] as const,

	// Native calendar events
	events: () => [...calendarKeys.all, "events"] as const,
	eventList: () => [...calendarKeys.events(), "list"] as const,
	eventDetail: (id: number) => [...calendarKeys.events(), id] as const,
};
