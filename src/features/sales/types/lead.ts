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

export interface Lead {
	leadId: number;
	name: string;
	email: string;
	phone?: string;
	company?: string;
	country?: string;
	source?: LeadSource;
	referenceType?: ReferenceType;
	referenceId?: number;
	referenceName?: string;
	priority: LeadPriority;
	expectedBudget?: number;
	expectedCloseDate?: string;
	lastContactAt?: string;
	nextFollowUpAt?: string;
	notes?: string;
	lossReason?: string;
	status: LeadStatus;
	activitiesCount?: number;
	meetingsCount?: number;
	quotationsCount?: number;
	createdAt: string;
	updatedAt: string;
	createdBy: number;
	updatedBy: number;
}

export interface LeadActivity {
	activityId: number;
	leadId: number;
	userId: number;
	userName?: string;
	type: "call" | "email" | "meeting" | "note" | "status_change";
	title: string;
	description?: string;
	outcome?: string;
	scheduledAt?: string;
	completedAt?: string;
	createdAt: string;
}

export interface LeadMeeting {
	meetingId: number;
	leadId: number;
	title: string;
	location: "online" | "office" | "client_site";
	meetingLink?: string;
	scheduledAt: string;
	durationMinutes: number;
	attendees: { userId: number; name: string; role: string }[];
	minutes?: string;
	outcome?: string;
	createdAt: string;
}

export interface CreateLeadPayload {
	name: string;
	email: string;
	phone?: string;
	company?: string;
	country?: string;
	source?: LeadSource;
	referenceType?: ReferenceType;
	referenceId?: number;
	priority?: LeadPriority;
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
}

export interface CreateMeetingPayload {
	title: string;
	location: "online" | "office" | "client_site";
	meetingLink?: string;
	scheduledAt: string;
	durationMinutes: number;
	attendees: { userId: number; role: string }[];
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
