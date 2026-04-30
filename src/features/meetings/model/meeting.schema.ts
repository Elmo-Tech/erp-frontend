import { z } from "zod";
import type { ScheduleMeetingPayload } from "@/entities/meeting/model/types";

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
		meetingType: z.enum([MeetingType.DISCOVERY, MeetingType.KICKOFF, MeetingType.REVIEW, MeetingType.STATUS, MeetingType.HANDOVER]),
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

export function toScheduleMeetingPayload(data: ScheduleMeetingFormData): ScheduleMeetingPayload {
	const scheduledAt = new Date(`${data.date}T${data.time}`).toISOString();
	const subjectId = data.relatedProjectId ? Number(data.relatedProjectId) : data.clientId;
	const subjectType = data.relatedProjectId ? "App\\Modules\\Project\\Models\\Project" : "App\\Modules\\CRM\\Models\\Client";

	const description = [
		`Client: ${data.clientName}`,
		`Meeting Type: ${MeetingTypeLabels[data.meetingType]}`,
		`Location Type: ${LocationTypeLabels[data.location_type]}`,
		`Location Details: ${data.location_details}`,
		data.internalAttendees.length ? `Internal Attendees: ${data.internalAttendees.join(", ")}` : null,
		data.externalAttendees.length ? `External Attendees: ${data.externalAttendees.join(", ")}` : null,
	].filter(Boolean);

	return {
		subjectType,
		subjectId,
		type: "meeting",
		title: `${MeetingTypeLabels[data.meetingType]} Meeting`,
		description: description.join("\n"),
		scheduledAt,
		assignedTo: data.internalAttendees[0] ? Number(data.internalAttendees[0]) : undefined,
	};
}
