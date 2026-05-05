/**
 * Polymorphic Meetings Entity — types
 *
 * These types are model-agnostic. The same Meeting can belong to a Lead,
 * a Client, or a Project. The `modelType` / `modelId` props on the UI
 * components determine which API endpoint is called.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Meeting status — with strict completion_note requirement
// ─────────────────────────────────────────────────────────────────────────────

export const MEETING_STATUSES = ["scheduled", "held", "cancelled", "no_show"] as const;
export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
	scheduled: "Scheduled",
	held: "Held",
	cancelled: "Cancelled",
	no_show: "No-Show",
};

/** Statuses that require a completion_note before saving */
export const STATUSES_REQUIRING_NOTE: MeetingStatus[] = ["held", "cancelled", "no_show"];

// ─────────────────────────────────────────────────────────────────────────────
// Meeting types
// ─────────────────────────────────────────────────────────────────────────────

export const MEETING_TYPES = ["discovery", "kickoff", "review", "status", "handover", "demo", "negotiation"] as const;
export type MeetingType = (typeof MEETING_TYPES)[number];

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
	discovery: "Discovery",
	kickoff: "Kickoff",
	review: "Review",
	status: "Status Review",
	handover: "Handover",
	demo: "Demo",
	negotiation: "Negotiation",
};

// ─────────────────────────────────────────────────────────────────────────────
// Location types
// ─────────────────────────────────────────────────────────────────────────────

export const LOCATION_TYPES = ["online", "client_site", "our_office", "other"] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
	online: "Online",
	client_site: "Client Site",
	our_office: "Our Office",
	other: "Other",
};

// ─────────────────────────────────────────────────────────────────────────────
// Polymorphic model reference
// ─────────────────────────────────────────────────────────────────────────────

export type MeetingModelType = "lead" | "client" | "project";

/** Maps frontend model type to the backend morph class string */
export const MODEL_TYPE_TO_MORPH: Record<MeetingModelType, string> = {
	lead: "App\\Modules\\Lead\\Models\\Lead",
	client: "App\\Modules\\Client\\Models\\Client",
	project: "App\\Modules\\Project\\Models\\Project",
};

// ─────────────────────────────────────────────────────────────────────────────
// Meeting entity
// ─────────────────────────────────────────────────────────────────────────────

export interface PolyMeeting {
	id: number;
	modelType: MeetingModelType;
	modelId: number;
	meetingType: MeetingType;
	status: MeetingStatus;
	title: string;
	description?: string | null;
	scheduledAt: string;
	completionNote?: string | null;
	assignedTo?: {
		userId: number;
		name: string;
		email: string;
		avatar?: string;
	} | null;
	internalAttendees: string[];
	externalAttendees: string[];
	locationType: LocationType;
	locationDetails?: string | null;
	createdAt: string;
	updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API payloads
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateMeetingPayload {
	model_type: string; // morph class
	model_id: number;
	meeting_type: MeetingType;
	title: string;
	description?: string;
	scheduled_at: string;
	location_type: LocationType;
	location_details?: string;
	internal_attendees: number[];
	external_attendees: string[];
	assigned_to?: number;
}

export interface UpdateMeetingStatusPayload {
	status: MeetingStatus;
	/** Required when status !== "scheduled" */
	completion_note: string;
}
