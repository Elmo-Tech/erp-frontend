import { z } from "zod";
import { LOCATION_TYPES, STATUSES_REQUIRING_NOTE } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Create meeting schema
// ─────────────────────────────────────────────────────────────────────────────

export const createMeetingSchema = z
	.object({
		meetingType: z.string().trim().min(1, "Please select a meeting type"),
		// BUG FIX: title was required (min 1) which caused validation to fail before
		// PolyMeetingForm's auto-generation logic could run. It is now optional here;
		// the component auto-generates a title from meetingType when left blank.
		title: z.string().trim().default(""),
		date: z.string().trim().min(1, "Date is required"),
		time: z.string().trim().min(1, "Time is required"),
		locationType: z.enum(LOCATION_TYPES, { message: "Please select a location type" }),
		locationDetails: z.string().trim().min(1, "Location details are required"),
		internalAttendees: z.array(z.string()).min(1, "Select at least one internal attendee"),
		externalAttendees: z.array(z.string()).default([]),
		description: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.locationType === "online") {
			const parsed = z.string().url().safeParse(data.locationDetails);
			if (!parsed.success) {
				ctx.addIssue({
					code: "custom",
					path: ["locationDetails"],
					message: "Enter a valid meeting link (e.g. https://meet.google.com/…)",
				});
			}
		}
	});

export type CreateMeetingFormData = z.infer<typeof createMeetingSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Update status schema — completion_note REQUIRED for non-scheduled statuses
// ─────────────────────────────────────────────────────────────────────────────

export const updateMeetingStatusSchema = z
	.object({
		status: z.string().trim().min(1, "Please select a status"),
		completionNote: z.string().trim().optional(),
	})
	.superRefine((data, ctx) => {
		const requiresNote = STATUSES_REQUIRING_NOTE.includes(data.status as (typeof STATUSES_REQUIRING_NOTE)[number]);
		if (requiresNote && (!data.completionNote || data.completionNote.trim().length === 0)) {
			ctx.addIssue({
				code: "custom",
				path: ["completionNote"],
				message: `A completion note is required when marking a meeting as "${data.status}".`,
			});
		}
	});

export type UpdateMeetingStatusFormData = z.infer<typeof updateMeetingStatusSchema>;
