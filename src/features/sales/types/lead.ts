// Re-export enums from centralized statusHelpers
export { LeadStatus, LeadStatusLabels, LeadStatusColors, LeadPriority, LeadPriorityLabels, LeadPriorityColors } from "@/lib/statusHelpers";
import { LeadStatus, LeadPriority } from "@/lib/statusHelpers";

export enum LeadSource {
	FACEBOOK = "facebook",
	GOOGLE = "google",
	LINKEDIN = "linkedin",
	REFERRAL = "referral",
	DIRECT = "direct",
	WEBSITE = "website",
	OTHER = "other",
}

export enum ReferenceType {
	SALES_REP = "sales_rep",
	CLIENT_REFERRAL = "client_referral",
	EMPLOYEE = "employee",
}

export enum IndustrySector {
	MEDICAL = "medical",
	ECOMMERCE = "ecommerce",
	REAL_ESTATE = "real_estate",
	SAAS = "saas",
	EDUCATION = "education",
	FINTECH = "fintech",
	LOGISTICS = "logistics",
	HOSPITALITY = "hospitality",
	MANUFACTURING = "manufacturing",
	OTHER = "other",
}

export const IndustrySectorLabels: Record<IndustrySector, string> = {
	[IndustrySector.MEDICAL]: "Medical",
	[IndustrySector.ECOMMERCE]: "E-Commerce",
	[IndustrySector.REAL_ESTATE]: "Real Estate",
	[IndustrySector.SAAS]: "SaaS",
	[IndustrySector.EDUCATION]: "Education",
	[IndustrySector.FINTECH]: "FinTech",
	[IndustrySector.LOGISTICS]: "Logistics",
	[IndustrySector.HOSPITALITY]: "Hospitality",
	[IndustrySector.MANUFACTURING]: "Manufacturing",
	[IndustrySector.OTHER]: "Other",
};

export const IndustrySectorIcons: Record<IndustrySector, string> = {
	[IndustrySector.MEDICAL]: "🏥",
	[IndustrySector.ECOMMERCE]: "🛒",
	[IndustrySector.REAL_ESTATE]: "🏢",
	[IndustrySector.SAAS]: "☁️",
	[IndustrySector.EDUCATION]: "📚",
	[IndustrySector.FINTECH]: "💳",
	[IndustrySector.LOGISTICS]: "🚚",
	[IndustrySector.HOSPITALITY]: "🏨",
	[IndustrySector.MANUFACTURING]: "🏭",
	[IndustrySector.OTHER]: "📦",
};

export enum LeadTemperature {
	HOT = "hot",
	WARM = "warm",
	COLD = "cold",
}

export const LeadTemperatureLabels: Record<LeadTemperature, string> = {
	[LeadTemperature.HOT]: "Hot",
	[LeadTemperature.WARM]: "Warm",
	[LeadTemperature.COLD]: "Cold",
};

export const LeadTemperatureColors: Record<LeadTemperature, string> = {
	[LeadTemperature.HOT]: "red",
	[LeadTemperature.WARM]: "orange",
	[LeadTemperature.COLD]: "blue",
};

export const LeadTemperatureIcons: Record<LeadTemperature, string> = {
	[LeadTemperature.HOT]: "🔥",
	[LeadTemperature.WARM]: "🌤️",
	[LeadTemperature.COLD]: "❄️",
};

export interface Lead {
	leadId: number;
	name: string;
	projectName?: string;
	email: string;
	phone?: string;
	company?: string;
	country?: string;
	timezoneOffset?: string;
	industrySector?: IndustrySector;
	industrySectorLabel?: string;
	industrySectorIcon?: string;
	source?: LeadSource;
	referenceType?: ReferenceType;
	referenceId?: number;
	referenceName?: string;
	techLeadId?: number;
	techLead?: {
		userId: number;
		name: string;
	};
	priority: LeadPriority;
	leadTemperature?: LeadTemperature;
	leadTemperatureLabel?: string;
	leadTemperatureColor?: string;
	leadTemperatureIcon?: string;
	expectedBudget?: number;
	expectedCloseDate?: string;
	lastContactAt?: string;
	nextFollowUpAt?: string;
	notes?: string;
	lossReason?: string;
	status: LeadStatus;
	// Conversion fields
	clientId?: number;
	convertedAt?: string;
	convertedBy?: number;
	convertedByName?: string;
	isConverted?: boolean;
	client?: {
		clientId: number;
		name: string;
		company?: string;
	};
	// Counts
	activitiesCount?: number;
	meetingsCount?: number;
	quotationsCount?: number;
	proposalsCount?: number;
	createdAt: string;
	updatedAt: string;
	createdBy: number;
	updatedBy: number;
}

export enum ActivityStatus {
	SCHEDULED = "scheduled",
	COMPLETED = "completed",
	CANCELLED = "cancelled",
}

export const ActivityStatusLabels: Record<ActivityStatus, string> = {
	[ActivityStatus.SCHEDULED]: "Scheduled",
	[ActivityStatus.COMPLETED]: "Completed",
	[ActivityStatus.CANCELLED]: "Cancelled",
};

export const ActivityStatusColors: Record<ActivityStatus, string> = {
	[ActivityStatus.SCHEDULED]: "blue",
	[ActivityStatus.COMPLETED]: "green",
	[ActivityStatus.CANCELLED]: "gray",
};

export enum MeetingStatus {
	SCHEDULED = "scheduled",
	COMPLETED = "completed",
	CANCELLED = "cancelled",
}

export const MeetingStatusLabels: Record<MeetingStatus, string> = {
	[MeetingStatus.SCHEDULED]: "Scheduled",
	[MeetingStatus.COMPLETED]: "Completed",
	[MeetingStatus.CANCELLED]: "Cancelled",
};

export const MeetingStatusColors: Record<MeetingStatus, string> = {
	[MeetingStatus.SCHEDULED]: "blue",
	[MeetingStatus.COMPLETED]: "green",
	[MeetingStatus.CANCELLED]: "gray",
};

export interface LeadActivity {
	activityId: number;
	leadId: number;
	userId: number;
	userName?: string;
	type: "call" | "email" | "meeting" | "note" | "status_change";
	typeLabel?: string;
	typeIcon?: string;
	status: ActivityStatus;
	statusLabel?: string;
	statusColor?: string;
	statusIcon?: string;
	title: string;
	description?: string;
	outcome?: string;
	cancellationReason?: string;
	nextAction?: string;
	reminderAt?: string;
	reminderSent?: boolean;
	outcomeReminderSent?: boolean;
	scheduledAt?: string;
	completedAt?: string;
	isScheduled?: boolean;
	isCompleted?: boolean;
	needsOutcome?: boolean;
	createdAt: string;
	updatedAt?: string;
}

export interface LeadMeeting {
	meetingId: number;
	leadId: number;
	title: string;
	location: "online" | "office" | "client_site";
	locationLabel?: string;
	status: MeetingStatus;
	statusLabel?: string;
	statusColor?: string;
	meetingLink?: string;
	scheduledAt: string;
	endTime?: string;
	durationMinutes: number;
	attendees: { userId: number; name: string; role: string }[];
	clientAttendees?: { name: string; email?: string; role?: string }[];
	minutes?: string;
	outcome?: string;
	attachments?: string[];
	cancellationReason?: string;
	reminderSent?: boolean;
	outcomeReminderSent?: boolean;
	googleCalendarEventId?: string;
	isScheduled?: boolean;
	isCompleted?: boolean;
	needsMinutes?: boolean;
	hasPassed?: boolean;
	lead?: {
		leadId: number;
		name: string;
		company?: string;
	};
	createdAt: string;
	updatedAt?: string;
}

export interface CreateLeadPayload {
	name: string;
	projectName?: string;
	email: string;
	phone?: string;
	company?: string;
	country?: string;
	timezoneOffset?: string;
	industrySector?: IndustrySector;
	source?: LeadSource;
	referenceType?: ReferenceType;
	referenceId?: number;
	techLeadId?: number;
	priority?: LeadPriority;
	leadTemperature?: LeadTemperature;
	expectedBudget?: number;
	expectedCloseDate?: string;
	notes?: string;
	status?: LeadStatus;
}

export type UpdateLeadPayload = Partial<CreateLeadPayload>;

export interface CreateActivityPayload {
	type: "call" | "email" | "meeting" | "note";
	title: string;
	description?: string;
	outcome?: string;
	scheduledAt?: string;
	completedAt?: string;
	nextAction?: string;
	reminderAt?: string;
}

export interface CompleteActivityPayload {
	outcome: string;
	nextAction?: string;
	reminderAt?: string;
}

export interface CancelActivityPayload {
	cancellationReason: string;
}

export interface CreateMeetingPayload {
	title: string;
	location: "online" | "office" | "client_site";
	meetingLink?: string;
	scheduledAt: string;
	durationMinutes: number;
	attendees: { userId: number; role: string }[];
	clientAttendees?: { name: string; email?: string; role?: string }[];
}

export interface CompleteMeetingPayload {
	minutes: string;
	outcome?: string;
	attachments?: File[];
}

export interface CancelMeetingPayload {
	cancellationReason: string;
}

export interface ScheduleResponse {
	activities: LeadActivity[];
	meetings: LeadMeeting[];
}

export interface LeadListResponse {
	leads: Lead[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}

export interface LeadKanbanResponse {
	[key: string]: Lead[];
}

export interface LeadFilters {
	search?: string;
	status?: LeadStatus;
	source?: LeadSource;
	priority?: LeadPriority;
	assignedTo?: number;
	page?: number;
	perPage?: number;
}
