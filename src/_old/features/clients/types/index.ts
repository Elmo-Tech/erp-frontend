import { ClientStatus, ClientStatusLabels, ClientStatusColors } from "@/shared/lib/statusHelpers";

export { ClientStatus, ClientStatusLabels, ClientStatusColors };

export interface Client {
	clientId: number;
	name: string;
	email: string;
	phone: string;
	company: string;
	position: string;
	address: string;
	city: string;
	country: string;
	website: string;
	notes: string;
	status: ClientStatus;
	userId?: number;
	leadId?: number;
	projectsCount?: number;
	totalRevenue?: number;
	activeProjectsCount?: number;
	hasPortalAccess?: boolean;
	projects?: ClientProject[];
	originalLead?: {
		leadId: number;
		name: string;
		source: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface ClientProject {
	projectId: number;
	title: string;
	status: string;
	budget: number;
	deadline?: string;
}

export interface ClientListResponse {
	clients: Client[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
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

export interface ClientFilters {
	search?: string;
	status?: ClientStatus;
	company?: string;
	hasPortalAccess?: boolean;
	page?: number;
	perPage?: number;
}
