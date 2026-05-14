import { z } from "zod";
import type { CreateMeetingPayload } from "@/entities/meetings/model/types";

export const MeetingType = {
	DISCOVERY: "discovery",
	KICKOFF: "kickoff",
	REVIEW: "review",
	STATUS: "status",
	HANDOVER: "handover",
} as const;

export type MeetingType = (typeof MeetingType)[keyof typeof MeetingType];

export const MeetingTypeLabels: Record<MeetingType, string> = {
	[MeetingType.DISCOVERY]: "Discovery",
	[MeetingType.KICKOFF]: "Kickoff",
	[MeetingType.REVIEW]: "Review",
	[MeetingType.STATUS]: "Status Review",
	[MeetingType.HANDOVER]: "Handover",
};

export const LocationType = {
	ONLINE: "online",
	CLIENT_SITE: "client_site",
	OUR_OFFICE: "our_office",
	OTHER: "other",
} as const;

export type LocationType = (typeof LocationType)[keyof typeof LocationType];

export const LocationTypeLabels: Record<LocationType, string> = {
	[LocationType.ONLINE]: "Online",
	[LocationType.CLIENT_SITE]: "Client Site",
	[LocationType.OUR_OFFICE]: "Our Office",
	[LocationType.OTHER]: "Other",
};

export const scheduleMeetingSchema = z
	.object({
		clientId: z.number().min(1, "Client is required"),
		clientName: z.string().trim().min(1, "Client is required"),
		relatedProjectId: z.string().trim().optional().or(z.literal("")),
		meetingType: z.string().trim().min(1, "Meeting type is required"),
		date: z.string().trim().min(1, "Date is required"),
		time: z.string().trim().min(1, "Time is required"),
		location_type: z.enum([LocationType.ONLINE, LocationType.CLIENT_SITE, LocationType.OUR_OFFICE, LocationType.OTHER]),
		location_details: z.string().trim().min(1, "Location details are required"),
		internalAttendees: z.array(z.string()).min(1, "Select at least one internal attendee"),
		externalAttendees: z.array(z.string()),
	})
	.superRefine((data, ctx) => {
		if (data.location_type !== LocationType.ONLINE) {
			return;
		}

		const parsedUrl = z.string().url().safeParse(data.location_details);
		if (!parsedUrl.success) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["location_details"],
				message: "Enter a valid meeting link",
			});
		}
	});

export type ScheduleMeetingFormData = z.infer<typeof scheduleMeetingSchema>;

function meetingTypeLabel(meetingType: string): string {
	return MeetingTypeLabels[meetingType as MeetingType] ?? meetingType.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function toScheduleMeetingPayload(data: ScheduleMeetingFormData, label = meetingTypeLabel(data.meetingType)): CreateMeetingPayload {
	const scheduledAt = new Date(`${data.date}T${data.time}`).toISOString();
	const subjectId = data.relatedProjectId ? Number(data.relatedProjectId) : data.clientId;
	// Use the correct backend namespace — must match CreateMeetingRequest validation
	const subjectType = data.relatedProjectId ? "App\\Modules\\Project\\Models\\Project" : "App\\Modules\\Client\\Models\\Client";

	const description = [
		`Client: ${data.clientName}`,
		`Meeting Type: ${label}`,
		`Location Type: ${LocationTypeLabels[data.location_type]}`,
		`Location Details: ${data.location_details}`,
		data.internalAttendees.length ? `Internal Attendees: ${data.internalAttendees.join(", ")}` : null,
		data.externalAttendees.length ? `External Attendees: ${data.externalAttendees.join(", ")}` : null,
	].filter(Boolean);

	return {
		model_type: subjectType,
		model_id: subjectId,
		meeting_type: data.meetingType,
		title: `${label} Meeting`,
		description: description.join("\n"),
		scheduled_at: scheduledAt,
		location_type: data.location_type,
		location_details: data.location_details,
		internal_attendees: data.internalAttendees.map(Number).filter((n) => !isNaN(n)),
		external_attendees: data.externalAttendees,
		assigned_to: data.internalAttendees[0] ? Number(data.internalAttendees[0]) : undefined,
	};
}
