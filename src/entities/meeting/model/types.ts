export interface Meeting {
	activityId: number;
	subjectId: number;
	subjectType: string;
	type: "meeting";
	typeLabel?: string;
	status: string;
	statusLabel?: string;
	title: string;
	description?: string | null;
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
	subjectType: "App\\Modules\\CRM\\Models\\Client" | "App\\Modules\\Project\\Models\\Project";
	subjectId: number;
	type: "meeting";
	title: string;
	description?: string;
	scheduledAt: string;
	assignedTo?: number;
}
