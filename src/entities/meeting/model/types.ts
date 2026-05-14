export interface Meeting {
	activityId: number;
	subjectId: number;
	subjectType: string;
	type: "meeting";
	typeLabel?: string;
	status: string;
	statusLabel?: string;
	statusColor?: string;
	title: string;
	description?: string | null;
	/** Raw location type value from the backend (e.g. "online", "client_site") */
	location?: string | null;
	locationDetails?: string | null;
	assignedTo?: {
		userId: number;
		name: string;
		email: string;
		avatar?: string;
	};
	scheduledAt?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface MeetingListResponse {
	meetings: Meeting[];
}

export interface ScheduleMeetingPayload {
	subjectType: "App\\Modules\\Client\\Models\\Client" | "App\\Modules\\Project\\Models\\Project";
	subjectId: number;
	type: "meeting";
	title: string;
	description?: string;
	scheduledAt: string;
	assignedTo?: number;
	meeting_type?: string;
	internal_attendees?: number[];
	external_attendees?: string[];
}
