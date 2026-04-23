import { ClientStatus, ClientStatusColors, ClientStatusLabels } from "@/shared/lib/statusHelpers";

export { ClientStatus, ClientStatusColors, ClientStatusLabels };

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
	name: string;
	email: string;
	phone: string | null;
	company: string | null;
	position: string | null;
	address: string | null;
	city: string | null;
	country: string | null;
	website: string | null;
	notes: string | null;
	status: ClientStatus;
	userId?: number | null;
	leadId?: number | null;
	projectsCount?: number;
	totalRevenue?: number | null;
	activeProjectsCount?: number;
	hasPortalAccess?: boolean;
	projects?: ClientProject[];
	originalLead?: OriginalLead | null;
	createdAt: string;
	updatedAt: string;
}

export interface ClientPagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

export interface ClientListResponse {
	clients: Client[];
	pagination: ClientPagination;
}

export interface ClientFilters {
	search?: string;
	status?: ClientStatus;
	company?: string;
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
