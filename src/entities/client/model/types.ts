import { ClientStatus, ClientStatusColors, ClientStatusLabels } from "@/shared/lib/statusHelpers";

export { ClientStatus, ClientStatusColors, ClientStatusLabels };

export enum ClientType {
	COMPANY = "company",
	INDIVIDUAL = "individual",
}

export const ClientTypeLabels: Record<ClientType, string> = {
	[ClientType.COMPANY]: "Company",
	[ClientType.INDIVIDUAL]: "Individual",
};

export interface Contact {
	contactId?: number;
	firstName?: string | null;
	lastName?: string | null;
	displayName: string;
	email?: string | null;
	phone?: string | null;
	mobile?: string | null;
	position?: string | null;
	department?: string | null;
	isPrimary?: boolean;
	notes?: string | null;
}

export interface ClientProject {
	projectId: number;
	title: string;
	status: string;
	budget: number;
	deadline?: string | null;
}

export interface OriginalLead {
	leadId: number;
	name: string;
	source: string;
}

export interface Client {
	clientId: number;
	type?: ClientType;
	displayName?: string;
	legalName?: string | null;
	companyName?: string | null;
	primaryEmail?: string | null;
	primaryPhone?: string | null;
	secondaryPhone?: string | null;
	name: string;
	email: string;
	phone: string | null;
	company: string | null;
	position: string | null;
	industry?: string | null;
	address: string | null;
	city: string | null;
	state?: string | null;
	country: string | null;
	postalCode?: string | null;
	website: string | null;
	taxNumber?: string | null;
	source?: string | null;
	lifecycleStage?: string | null;
	leadTemperature?: string | null;
	accountManagerId?: number | null;
	notes: string | null;
	metadata?: Record<string, unknown> | null;
	interests?: string[];
	status: ClientStatus;
	userId?: number | null;
	leadId?: number | null;
	accountManager?: {
		userId: number;
		name: string;
		email?: string | null;
	} | null;
	contacts?: Contact[];
	projectsCount?: number;
	totalRevenue?: number | null;
	activeProjectsCount?: number;
	hasPortalAccess?: boolean;
	projects?: ClientProject[];
	originalLead?: OriginalLead | null;
	createdAt: string;
	updatedAt: string;
}

export interface ClientIndexRow {
	id: number;
	type?: ClientType;
	display_name: string;
	email?: string | null;
	company_name?: string | null;
	position?: string | null;
	primary_phone?: string | null;
	status: ClientStatus;
	country?: string | null;
	projects_count: number;
	active_projects_count?: number;
	total_revenue?: number | null;
	created_at: string;
}

export interface ClientPagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

export interface ClientListResponse {
	clients: ClientIndexRow[];
	pagination: ClientPagination;
}

export interface ClientActivity {
	activityId: number;
	clientId: number;
	userId: number | null;
	action: string;
	description: string;
	user?: {
		userId: number;
		name: string;
		email?: string | null;
	} | null;
	createdAt: string;
}

export interface ClientActivityListResponse {
	activities: ClientActivity[];
}

export interface ClientFilters {
	search?: string;
	status?: ClientStatus;
	company?: string;
	email?: string;
	hasPortalAccess?: boolean;
	page?: number;
	perPage?: number;
}

export interface CreateClientPayload {
	name: string;
	email: string;
	phone?: string;
	company?: string;
	position?: string;
	type?: ClientType;
	displayName?: string;
	legalName?: string;
	companyName?: string;
	primaryEmail?: string;
	primaryPhone?: string;
	source?: string;
	accountManagerId?: number;
	interests?: string[];
	contactPerson?: Omit<Contact, "contactId">;
	metadata?: Record<string, unknown>;
	address?: string;
	city?: string;
	country?: string;
	website?: string;
	notes?: string;
	status?: ClientStatus;
}

export type UpdateClientPayload = Partial<CreateClientPayload>;

export interface ConvertLeadToClientPayload {
	leadId: number;
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

export interface CreatePortalAccessPayload {
	clientId: number;
	password: string;
	sendWelcomeEmail?: boolean;
}
