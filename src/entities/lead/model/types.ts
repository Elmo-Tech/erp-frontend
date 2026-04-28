import {
	LeadStatus,
	LeadStatusLabels,
	LeadStatusColors,
	LeadPriority,
	LeadPriorityLabels,
	LeadPriorityColors,
} from "@/shared/lib/statusHelpers";

export { LeadStatus, LeadStatusLabels, LeadStatusColors, LeadPriority, LeadPriorityLabels, LeadPriorityColors };

export enum LeadSource {
	FACEBOOK = "facebook",
	GOOGLE = "google",
	LINKEDIN = "linkedin",
	REFERRAL = "referral",
	DIRECT = "direct",
	WEBSITE = "website",
	OTHER = "other",
}

export const LeadSourceLabels: Record<LeadSource, string> = {
	[LeadSource.FACEBOOK]: "Facebook",
	[LeadSource.GOOGLE]: "Google",
	[LeadSource.LINKEDIN]: "LinkedIn",
	[LeadSource.REFERRAL]: "Referral",
	[LeadSource.DIRECT]: "Direct",
	[LeadSource.WEBSITE]: "Website",
	[LeadSource.OTHER]: "Other",
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

export interface Lead {
	leadId: number;
	name: string;
	projectName?: string;
	email: string;
	phone?: string;
	company?: string;
	country?: string;
	timezoneOffset?: string;
	source?: LeadSource;
	priority: LeadPriority;
	leadTemperature?: LeadTemperature;
	expectedBudget?: number;
	expectedCloseDate?: string;
	lastContactAt?: string;
	nextFollowUpAt?: string;
	notes?: string;
	lossReason?: string;
	status: LeadStatus;
	clientId?: number;
	convertedAt?: string;
	isConverted?: boolean;
	client?: {
		clientId: number;
		name: string;
		company?: string;
	};
	activitiesCount?: number;
	meetingsCount?: number;
	quotationsCount?: number;
	proposalsCount?: number;
	createdAt: string;
	updatedAt: string;
}

export interface LeadPagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

export interface LeadListResponse {
	leads: Lead[];
	pagination: LeadPagination;
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

export interface CreateLeadPayload {
	name: string;
	projectName?: string;
	email: string;
	phone?: string;
	company?: string;
	country?: string;
	timezoneOffset?: string;
	source?: LeadSource;
	priority?: LeadPriority;
	leadTemperature?: LeadTemperature;
	expectedBudget?: number;
	expectedCloseDate?: string;
	notes?: string;
	status?: LeadStatus;
}

export type UpdateLeadPayload = Partial<CreateLeadPayload>;

export interface ConvertLeadPayload {
	name?: string;
	email?: string;
	phone?: string;
	company?: string;
	position?: string;
	address?: string;
	city?: string;
	country?: string;
	website?: string;
	notes?: string;
}

export interface CanConvertResponse {
	canConvert: boolean;
	reason: string | null;
	existingClientId: number | null;
	existingClientName: string | null;
}
