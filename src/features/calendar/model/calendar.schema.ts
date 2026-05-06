/**
 * features/calendar/model/calendar.schema.ts
 *
 * Zod v4 validation schemas for Calendar forms.
 * Derived directly from:
 *   - StoreCalendarEventRequest / UpdateCalendarEventRequest
 *
 * NOTE: Zod v4 uses `error` instead of `invalid_type_error` / `required_error`.
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Calendar Event Schema
// Matches: StoreCalendarEventRequest rules
//   title: required, string, max:255
//   description: nullable, string
//   startTime: required, date
//   endTime: required, date, after_or_equal:startTime
//   eventType: sometimes, in:meeting,reminder,custom
// ─────────────────────────────────────────────────────────────────────────────

export const calendarEventSchema = z
	.object({
		title: z.string().min(1, "Title is required").max(255, "Max 255 characters"),
		description: z.string().nullable().optional(),
		startTime: z.string().min(1, "Start time is required"),
		endTime: z.string().min(1, "End time is required"),
		eventType: z.enum(["meeting", "reminder", "custom"]).default("custom"),
	})
	.refine((d) => !d.endTime || !d.startTime || d.endTime >= d.startTime, {
		message: "End time must be on or after start time",
		path: ["endTime"],
	});

export type CalendarEventFormData = z.output<typeof calendarEventSchema>;

// Default start = now (rounded to next hour), end = +1 hour
function getDefaultTimes() {
	const now = new Date();
	now.setMinutes(0, 0, 0);
	now.setHours(now.getHours() + 1);
	const start = now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
	now.setHours(now.getHours() + 1);
	const end = now.toISOString().slice(0, 16);
	return { start, end };
}

const { start, end } = getDefaultTimes();

export const CALENDAR_EVENT_DEFAULT_VALUES = {
	title: "",
	description: "" as string | null,
	startTime: start,
	endTime: end,
	eventType: "custom" as const,
};
